import { describe, expect, it, vi } from 'vitest'
import { requestStorageStatus } from './storage'

describe('persistent storage capability', () => {
  it('works without browser support', async () => {
    expect(await requestStorageStatus(undefined)).toEqual({supported:false,persistent:false,usageBytes:null})
  })
  it('requests persistence when available', async () => {
    const persist = vi.fn().mockResolvedValue(true)
    const storage = {persisted:vi.fn().mockResolvedValue(false),persist,estimate:vi.fn().mockResolvedValue({usage:2048})} as unknown as StorageManager
    expect(await requestStorageStatus(storage)).toEqual({supported:true,persistent:true,usageBytes:2048})
    expect(persist).toHaveBeenCalledOnce()
  })
  it('works when persistence is denied', async () => {
    const storage = {persisted:vi.fn().mockResolvedValue(false),persist:vi.fn().mockRejectedValue(new Error('denied')),estimate:vi.fn().mockResolvedValue({})} as unknown as StorageManager
    expect(await requestStorageStatus(storage)).toEqual({supported:true,persistent:false,usageBytes:null})
  })
})
