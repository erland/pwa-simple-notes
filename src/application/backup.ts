import type { NoteBlock, NoteRepository, Section, Snapshot } from '../domain/model'

export const BACKUP_FORMAT_VERSION = 1
export interface BackupFile { format: 'simple-notes-backup'; formatVersion: number; exportedAt: string; data: Snapshot }
export function makeBackup(snapshot: Snapshot, timestamp = new Date().toISOString()): BackupFile {
  return { format: 'simple-notes-backup', formatVersion: BACKUP_FORMAT_VERSION, exportedAt: timestamp, data: structuredClone(snapshot) }
}
export function serializeBackup(snapshot: Snapshot) { return JSON.stringify(makeBackup(snapshot), null, 2) }
export function backupFilename(date = new Date()) { return `simple-notes-${date.toISOString().slice(0,10)}.snotes` }
const record = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const dateString = (v: unknown): v is string => typeof v === 'string' && Number.isFinite(Date.parse(v))
const text = (v: unknown): v is string => typeof v === 'string'
const optionalText = (v: unknown): v is string | null => v === null || text(v)
function validNote(n: unknown): n is NoteBlock {
  return record(n) && text(n.id) && n.id.length > 0 && text(n.text) && n.text.trim().length > 0 && dateString(n.createdAt) && dateString(n.updatedAt) && optionalText(n.sectionId) && typeof n.important === 'boolean' && ['none','open','completed'].includes(String(n.actionStatus)) && optionalText(n.actionResolution) && (n.actionCompletedAt === null || dateString(n.actionCompletedAt)) && (n.actionStatus !== 'completed' || (text(n.actionResolution) && n.actionResolution.trim().length > 0 && dateString(n.actionCompletedAt)))
}
function validSection(s: unknown): s is Section {
  return record(s) && text(s.id) && s.id.length > 0 && ['standard','meeting'].includes(String(s.type)) && text(s.title) && s.title.trim().length > 0 && dateString(s.createdAt) && dateString(s.startedAt) && (s.endedAt === null || dateString(s.endedAt)) && (s.meetingTime === null || dateString(s.meetingTime)) && Array.isArray(s.participants) && s.participants.every(text) && (s.type !== 'meeting' || dateString(s.meetingTime))
}
export function parseBackup(raw: string): BackupFile {
  let value: unknown
  try { value = JSON.parse(raw) } catch { throw new Error('Filen innehåller inte giltig JSON.') }
  if (!record(value) || value.format !== 'simple-notes-backup') throw new Error('Filen är inte en Simple Notes-backup.')
  if (value.formatVersion !== BACKUP_FORMAT_VERSION) throw new Error('Backupversionen stöds inte av den här appen.')
  if (!dateString(value.exportedAt) || !record(value.data) || !Array.isArray(value.data.notes) || !Array.isArray(value.data.sections)) throw new Error('Backupen har ogiltig struktur.')
  const { notes, sections } = value.data
  if (!notes.every(validNote) || !sections.every(validSection)) throw new Error('Backupen innehåller ogiltig anteckningsdata.')
  const noteIds = new Set(notes.map((n: NoteBlock) => n.id)), sectionIds = new Set(sections.map((s: Section) => s.id))
  if (noteIds.size !== notes.length || sectionIds.size !== sections.length || sections.filter((s: Section) => !s.endedAt).length > 1 || notes.some((n: NoteBlock) => n.sectionId && !sectionIds.has(n.sectionId))) throw new Error('Backupen har dubbletter eller brutna relationer.')
  return value as unknown as BackupFile
}
export async function restoreBackup(repo: NoteRepository, backup: BackupFile, confirmed: boolean): Promise<void> {
  if (!confirmed) throw new Error('Återställningen måste bekräftas.')
  const validated = parseBackup(JSON.stringify(backup))
  await repo.replace(validated.data)
  const after = await repo.snapshot()
  if (after.notes.length !== validated.data.notes.length || after.sections.length !== validated.data.sections.length) throw new Error('Återställningen kunde inte verifieras.')
}
export async function exportBackup(repo: NoteRepository) { return serializeBackup(await repo.snapshot()) }
