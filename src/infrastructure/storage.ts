export interface StorageStatus { supported: boolean; persistent: boolean; usageBytes: number | null }
export async function requestStorageStatus(storage: StorageManager | undefined = navigator.storage): Promise<StorageStatus> {
  if (!storage) return { supported: false, persistent: false, usageBytes: null }
  let persistent = await storage.persisted()
  if (!persistent && storage.persist) {
    try { persistent = await storage.persist() } catch { /* Browsers may deny the request. */ }
  }
  const estimate = await storage.estimate()
  return { supported: true, persistent, usageBytes: estimate.usage ?? null }
}
