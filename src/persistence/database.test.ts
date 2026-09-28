import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it } from 'vitest'
import { createNote, startSection } from '../domain/model'
import { IndexedDbRepository, openDatabase } from './database'
import { NotesService } from '../application/notes'

const names: string[] = []
const uniqueName = () => { const n = `test-${crypto.randomUUID()}`; names.push(n); return n }
afterEach(async () => { for (const name of names.splice(0)) indexedDB.deleteDatabase(name) })
describe('IndexedDB persistence', () => {
  it('migrates version 1 without losing notes', async () => {
    const name = uniqueName()
    const legacy = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(name, 1)
      request.onupgradeneeded = () => { request.result.createObjectStore('notes', {keyPath:'id'}).createIndex('createdAt','createdAt'); request.result.createObjectStore('sections', {keyPath:'id'}) }
      request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error)
    })
    const repo = new IndexedDbRepository(legacy), note = createNote('legacy')
    await repo.putNote(note); repo.close()
    const upgraded = await openDatabase(name)
    expect(upgraded.version).toBe(4)
    expect(upgraded.transaction('notes').objectStore('notes').indexNames.contains('important')).toBe(true)
    expect(upgraded.objectStoreNames.contains('settings')).toBe(true)
    expect((await new IndexedDbRepository(upgraded).getNote(note.id))?.text).toBe('legacy')
    upgraded.close()
  })
  it('persists notes and section association across reopen', async () => {
    const name = uniqueName(), db = await openDatabase(name), repo = new IndexedDbRepository(db), service = new NotesService(repo)
    const section = await service.start('Topic')
    const note = await service.create('Initial')
    await service.edit(note.id, 'Updated')
    repo.close()
    const reopened = new IndexedDbRepository(await openDatabase(name))
    expect((await reopened.getNote(note.id))?.sectionId).toBe(section.id)
    expect((await reopened.getNote(note.id))?.createdAt).toBe(note.createdAt)
    expect((await reopened.getNote(note.id))?.text).toBe('Updated')
    expect((await reopened.listSections())[0].title).toBe('Topic')
    reopened.close()
  })
  it('pages deterministic order with equal timestamps at scale', async () => {
    const db = await openDatabase(uniqueName()), repo = new IndexedDbRepository(db)
    const timestamp = '2026-01-01T00:00:00.000Z'
    const notes = Array.from({length: 3000}, (_, i) => ({...createNote('Entry ' + i, null, timestamp), id: String(i).padStart(5, '0')}))
    await repo.replace({notes,sections:[]})
    const first = await repo.listNotes(50)
    const second = await repo.listNotes(50, first.at(-1))
    expect(new Set([...first,...second].map(n => n.id)).size).toBe(100)
    expect(first[0].id).toBe('02999')
    expect(second.at(-1)?.id).toBe('02900')
    repo.close()
  })
  it('keeps action completion and important flag across reopen, and detaches notes after section close', async () => {
    const name = uniqueName(), repo = new IndexedDbRepository(await openDatabase(name)), service = new NotesService(repo)
    const section = await service.start('Möte', 'meeting', '2026-09-28T08:00:00.000Z', ['Ada', 'Bo'])
    const original = await service.create('Follow up')
    await service.markAction(original.id)
    await service.finishAction(original.id, 'Called Ada')
    await service.markImportant(original.id)
    await service.close(section.id)
    const next = await service.create('Outside section')
    repo.close()
    const reopened = new IndexedDbRepository(await openDatabase(name))
    expect((await reopened.getNote(original.id))).toMatchObject({sectionId: section.id, actionStatus:'completed', actionResolution:'Called Ada', important:true})
    expect((await reopened.getNote(original.id))?.actionCompletedAt).toBeTruthy()
    expect((await reopened.getNote(next.id))?.sectionId).toBeNull()
    expect((await reopened.getSection(section.id))?.participants).toEqual(['Ada','Bo'])
    reopened.close()
  })
  it('atomically replaces a snapshot', async () => {
    const db = await openDatabase(uniqueName()), repo = new IndexedDbRepository(db)
    await repo.putNote(createNote('old'))
    const section = startSection([], 'Restored'), note = createNote('restored', section.id)
    await repo.replace({notes:[note],sections:[section]})
    expect((await repo.snapshot()).notes.map(n=>n.text)).toEqual(['restored'])
    repo.close()
  })
})
