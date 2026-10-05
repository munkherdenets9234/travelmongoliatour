export interface Cleaned<T = string> { ok: boolean; value: T }

export function cleanString(raw: unknown, opts?: { min?: number; max?: number; multiline?: boolean }): Cleaned
export function cleanEmail(raw: unknown): Cleaned
export function cleanPhone(raw: unknown): Cleaned
export function cleanChoice<T extends string>(raw: unknown, allowed: readonly T[]): Cleaned<T | ''>
export function cleanInt(raw: unknown, opts: { min: number; max: number }): Cleaned<number>
export function cleanDate(raw: unknown, opts?: { now?: number; allowPast?: boolean; maxDaysAhead?: number }): Cleaned
export function isHoneypotTripped(body: unknown, field?: string): boolean
export function createRateLimiter(opts?: {
  capacity?: number
  refillPerSec?: number
  maxKeys?: number
  now?: () => number
}): {
  take(key: string): { allowed: boolean; retryAfterSec: number }
  size(): number
}
export function visitorIp(getHeader: (name: string) => string | null | undefined): string
export const GENERIC_ERRORS: { invalid: string; rateLimited: string; upstream: string; notFound: string }
export function redactForLog(message: unknown): string
