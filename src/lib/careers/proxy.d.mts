export function checkBodySize(contentLength: number | string | null | undefined, maxBytes: number): boolean
export function clientIp(headers: { get(name: string): string | null }): string | null
export function createRateLimiter(opts: {
  max: number
  windowMs: number
  now?: () => number
  maxKeys?: number
}): {
  allow(key: string): boolean
  size(): number
}
export function buildForwardForm(incoming: FormData): { ok: true; form: FormData } | { ok: false }
