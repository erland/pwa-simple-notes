export type ActionStatus = 'none' | 'open' | 'completed'
export type SectionType = 'standard' | 'meeting'
export interface NoteBlock {
  id: string
  text: string
  createdAt: string
  updatedAt: string
  sectionId: string | null
  important: boolean
  actionStatus: ActionStatus
  actionResolution: string | null
  actionCompletedAt: string | null
}
export interface Section {
  id: string
  type: SectionType
  title: string
  createdAt: string
  startedAt: string
  endedAt: string | null
  meetingTime: string | null
  participants: string[]
}
export interface Snapshot { notes: NoteBlock[]; sections: Section[] }
export interface NoteRepository {
  putNote(note: NoteBlock): Promise<void>
  getNote(id: string): Promise<NoteBlock | undefined>
  listNotes(limit?: number, before?: NoteBlock): Promise<NoteBlock[]>
  putSection(section: Section): Promise<void>
  getSection(id: string): Promise<Section | undefined>
  listSections(): Promise<Section[]>
  snapshot(): Promise<Snapshot>
  replace(snapshot: Snapshot): Promise<void>
}
export const now = () => new Date().toISOString()
export const newId = () => crypto.randomUUID()
export function createNote(text: string, sectionId: string | null = null, timestamp = now()): NoteBlock {
  if (!text.trim()) throw new Error('Anteckningen får inte vara tom.')
  return { id: newId(), text: text.trim(), sectionId, createdAt: timestamp, updatedAt: timestamp, important: false, actionStatus: 'none', actionResolution: null, actionCompletedAt: null }
}
export function editNote(note: NoteBlock, text: string, timestamp = now()): NoteBlock {
  if (!text.trim()) throw new Error('Anteckningen får inte vara tom.')
  return { ...note, text: text.trim(), updatedAt: timestamp }
}
export function setAction(note: NoteBlock, status: 'none' | 'open', timestamp = now()): NoteBlock {
  return { ...note, actionStatus: status, actionResolution: null, actionCompletedAt: null, updatedAt: timestamp }
}
export function completeAction(note: NoteBlock, resolution: string, timestamp = now()): NoteBlock {
  if (note.actionStatus !== 'open') throw new Error('Bara öppna åtgärder kan slutföras.')
  if (!resolution.trim()) throw new Error('Ange hur åtgärden löstes.')
  return { ...note, actionStatus: 'completed', actionResolution: resolution.trim(), actionCompletedAt: timestamp, updatedAt: timestamp }
}
export function startSection(sections: Section[], title: string, type: SectionType = 'standard', meetingTime: string | null = null, participants: string[] = [], timestamp = now()): Section {
  if (sections.some(s => s.endedAt === null)) throw new Error('Avsluta den aktiva sektionen först.')
  if (!title.trim()) throw new Error('Ange en rubrik.')
  if (type === 'meeting' && (!meetingTime || !Number.isFinite(Date.parse(meetingTime)))) throw new Error('Ange en giltig mötestid.')
  return { id: newId(), type, title: title.trim(), createdAt: timestamp, startedAt: timestamp, endedAt: null, meetingTime: type === 'meeting' ? meetingTime : null, participants: type === 'meeting' ? participants.map(p => p.trim()).filter(Boolean) : [] }
}
export function closeSection(section: Section, timestamp = now()): Section {
  if (section.endedAt) throw new Error('Sektionen är redan avslutad.')
  return { ...section, endedAt: timestamp }
}
export function searchSnapshot(snapshot: Snapshot, query: string): { notes: NoteBlock[]; sections: Section[] } {
  const needle = query.trim().toLocaleLowerCase()
  if (!needle) return { notes: [], sections: [] }
  const sections = snapshot.sections.filter(s => [s.title, ...s.participants].some(v => v.toLocaleLowerCase().includes(needle)))
  return { sections, notes: snapshot.notes.filter(n => [n.text, n.actionResolution ?? ''].some(v => v.toLocaleLowerCase().includes(needle)) || sections.some(s => s.id === n.sectionId)) }
}
