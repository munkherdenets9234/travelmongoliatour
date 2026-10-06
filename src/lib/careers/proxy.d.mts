export function checkBodySize(contentLength: number | string | null | undefined, maxBytes: number): boolean
export function fieldFromMessage(message: unknown): string | undefined
export function buildForwardForm(incoming: FormData): { ok: true; form: FormData } | { ok: false }
