export type SyncValue = string | string[] | Array<Record<string, string>>
export type SyncLangs = { en?: SyncValue; mn?: SyncValue; ko?: SyncValue }
export type SyncEntry = { path: string; values: SyncLangs; base?: SyncLangs }
export type SyncCounts = {
  created: number
  synced: number
  unchanged: number
  skipped: number
  tooLarge: number
  failed: number
  wouldSync: number
}

export function valuesEqual(a: unknown, b: unknown): boolean
export function planSync(stored: SyncEntry[], shipped: SyncEntry[]): { entries: SyncEntry[]; changed: boolean; count: number }
export function syncPages(opts: {
  pages: Record<string, SyncEntry[]>
  fetchImpl: typeof fetch
  baseUrl: string
  headers: Record<string, string>
  dryRun?: boolean
  log?: (line: string) => void
}): Promise<SyncCounts>
