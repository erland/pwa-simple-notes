import { describe, expect, it } from 'vitest'
import { closeSection, completeAction, createNote, editNote, searchSnapshot, setAction, startSection } from './model'

describe('domain rules', () => {
  it('preserves creation time and transitions actions', () => {
    const note = createNote('text', null, '2026-01-01T00:00:00.000Z')
    const edited = editNote(note, 'new', '2026-01-02T00:00:00.000Z')
    expect(edited.createdAt).toBe(note.createdAt)
    const completed = completeAction(setAction(edited, 'open'), 'done')
    expect(completed.actionStatus).toBe('completed')
    expect(completed.actionResolution).toBe('done')
    expect(completed.actionCompletedAt).toBeTruthy()
    expect(() => completeAction(note, 'done')).toThrow()
  })
  it('allows only one active section', () => {
    const first = startSection([], 'Topic')
    expect(() => startSection([first], 'Second')).toThrow()
    expect(startSection([closeSection(first)], 'Second').title).toBe('Second')
  })
  it('searches meeting participants and action resolution', () => {
    const section = startSection([], 'Meeting', 'meeting', new Date().toISOString(), ['Ada'])
    const note = completeAction(setAction(createNote('Discuss', section.id), 'open'), 'Sent proposal')
    expect(searchSnapshot({notes:[note],sections:[section]}, 'ada').notes).toHaveLength(1)
    expect(searchSnapshot({notes:[note],sections:[section]}, 'proposal').notes).toHaveLength(1)
  })
})
