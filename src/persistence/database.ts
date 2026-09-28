import type { NoteBlock, NoteRepository, Section, Snapshot } from '../domain/model'

export const DATABASE_VERSION = 4
const STORES = ['notes', 'sections'] as const
function result<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error) })
}
function transactionDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => { tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error ?? new Error('Databastransaktionen avbröts.')) })
}
export function openDatabase(name = 'simple-notes'): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, DATABASE_VERSION)
    request.onerror = () => reject(request.error)
    request.onupgradeneeded = (event) => {
      const eventOldVersion = event.oldVersion
      const db = request.result
      if (!db.objectStoreNames.contains('notes')) {
        const notes = db.createObjectStore('notes', { keyPath: 'id' })
        notes.createIndex('createdAt', 'createdAt')
        notes.createIndex('sectionId', 'sectionId')
      }
      if (!db.objectStoreNames.contains('sections')) db.createObjectStore('sections', { keyPath: 'id' })
      if (request.transaction && eventOldVersion < 2) {
        const notes = request.transaction.objectStore('notes')
        if (!notes.indexNames.contains('actionStatus')) notes.createIndex('actionStatus', 'actionStatus')
        if (!notes.indexNames.contains('important')) notes.createIndex('important', 'important')
      }
      if (request.transaction && eventOldVersion < 3) {
        const notes = request.transaction.objectStore('notes')
        if (!notes.indexNames.contains('timeline')) notes.createIndex('timeline', ['createdAt', 'id'])
      }
      if (eventOldVersion < 4 && !db.objectStoreNames.contains('settings')) db.createObjectStore('settings', { keyPath: 'key' })
    }
    request.onsuccess = () => resolve(request.result)
  })
}
export class IndexedDbRepository implements NoteRepository {
  constructor(private db: IDBDatabase) {}
  close() { this.db.close() }
  async putNote(note: NoteBlock) { const tx = this.db.transaction('notes', 'readwrite'); const done = transactionDone(tx); tx.objectStore('notes').put(note); await done }
  async getNote(id: string) { return result<NoteBlock | undefined>(this.db.transaction('notes').objectStore('notes').get(id)) }
  async listNotes(limit = Infinity, before?: NoteBlock): Promise<NoteBlock[]> {
    const tx = this.db.transaction('notes')
    const index = tx.objectStore('notes').index('timeline')
    return new Promise((resolve, reject) => {
      const notes: NoteBlock[] = []
      const cursor = index.openCursor(before ? IDBKeyRange.upperBound([before.createdAt, before.id], true) : undefined, 'prev')
      cursor.onerror = () => reject(cursor.error)
      cursor.onsuccess = () => {
        const current = cursor.result
        if (!current || notes.length >= limit) { resolve(notes); return }
        notes.push(current.value as NoteBlock); current.continue()
      }
    })
  }
  async putSection(section: Section) { const tx = this.db.transaction('sections', 'readwrite'); const done = transactionDone(tx); tx.objectStore('sections').put(section); await done }
  async getSection(id: string) { return result<Section | undefined>(this.db.transaction('sections').objectStore('sections').get(id)) }
  async listSections() { return result<Section[]>(this.db.transaction('sections').objectStore('sections').getAll()) }
  async snapshot(): Promise<Snapshot> {
    const tx = this.db.transaction(STORES)
    const notes = result<NoteBlock[]>(tx.objectStore('notes').getAll())
    const sections = result<Section[]>(tx.objectStore('sections').getAll())
    const [allNotes, allSections] = await Promise.all([notes, sections])
    return { notes: allNotes, sections: allSections }
  }
  async replace(snapshot: Snapshot) {
    const tx = this.db.transaction(STORES, 'readwrite'); const done = transactionDone(tx)
    const noteStore = tx.objectStore('notes'), sectionStore = tx.objectStore('sections')
    noteStore.clear(); sectionStore.clear()
    for (const note of snapshot.notes) noteStore.put(note)
    for (const section of snapshot.sections) sectionStore.put(section)
    await done
  }
}
