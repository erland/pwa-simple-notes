import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { createNote, startSection } from '../domain/model'
import { IndexedDbRepository, openDatabase } from '../persistence/database'
import { makeBackup, parseBackup, restoreBackup, serializeBackup } from './backup'

describe('backup and restore', () => {
  it('round-trips complete data including actions and meetings', async () => {
    const name = `backup-${crypto.randomUUID()}`
    const repo = new IndexedDbRepository(await openDatabase(name))
    const section = startSection([], 'Meeting', 'meeting', new Date().toISOString(), ['Ada'])
    const note = { ...createNote('Task', section.id), actionStatus: 'completed' as const, actionResolution: 'Done', actionCompletedAt: new Date().toISOString(), important: true }
    await repo.replace({notes:[note],sections:[section]})
    const original = await repo.snapshot()
    const backup = parseBackup(serializeBackup(original))
    await repo.replace({notes:[],sections:[]})
    await restoreBackup(repo, backup, true)
    expect(await repo.snapshot()).toEqual(original)
    repo.close(); indexedDB.deleteDatabase(name)
  })
  it('rejects malformed, unsupported and broken backups without changing data', async () => {
    const name = `backup-${crypto.randomUUID()}`, repo = new IndexedDbRepository(await openDatabase(name))
    await repo.putNote(createNote('Keep'))
    const before = await repo.snapshot()
    const valid = makeBackup(before)
    for (const raw of ['{', JSON.stringify({...valid,formatVersion:99}), JSON.stringify({...valid,data:{notes:[{...before.notes[0],sectionId:'missing'}],sections:[]}})]) {
      expect(() => parseBackup(raw)).toThrow()
      expect(await repo.snapshot()).toEqual(before)
    }
    await expect(restoreBackup(repo, valid, false)).rejects.toThrow()
    expect(await repo.snapshot()).toEqual(before)
    repo.close(); indexedDB.deleteDatabase(name)
  })
})
