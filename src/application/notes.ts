import { closeSection, completeAction, createNote, editNote, now, searchSnapshot, setAction, startSection, type NoteBlock, type NoteRepository, type Section, type SectionType } from '../domain/model'

export class NotesService {
  constructor(private repo: NoteRepository) {}
  async create(text: string) {
    const active = (await this.repo.listSections()).find(s => !s.endedAt)
    const note = createNote(text, active?.id ?? null)
    await this.repo.putNote(note)
    return note
  }
  async edit(id: string, text: string) { return this.update(id, n => editNote(n, text)) }
  async markImportant(id: string) { return this.update(id, n => ({ ...n, important: !n.important, updatedAt: now() })) }
  async markAction(id: string) { return this.update(id, n => setAction(n, n.actionStatus === 'none' ? 'open' : 'none')) }
  async finishAction(id: string, resolution: string) { return this.update(id, n => completeAction(n, resolution)) }
  private async update(id: string, fn: (n: NoteBlock) => NoteBlock) {
    const existing = await this.repo.getNote(id)
    if (!existing) throw new Error('Anteckningen hittades inte.')
    const updated = fn(existing)
    await this.repo.putNote(updated)
    return updated
  }
  async start(title: string, type: SectionType = 'standard', meetingTime: string | null = null, participants: string[] = []) {
    const section = startSection(await this.repo.listSections(), title, type, meetingTime, participants)
    await this.repo.putSection(section); return section
  }
  async close(id: string) {
    const section = await this.repo.getSection(id)
    if (!section) throw new Error('Sektionen hittades inte.')
    const closed = closeSection(section); await this.repo.putSection(closed); return closed
  }
  async search(query: string) { return searchSnapshot(await this.repo.snapshot(), query) }
  async list(limit = 50, before?: NoteBlock) { return this.repo.listNotes(limit, before) }
  async sections(): Promise<Section[]> { return this.repo.listSections() }
}
