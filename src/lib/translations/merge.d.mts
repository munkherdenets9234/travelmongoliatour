export type TranslationLeaf = string | string[] | Array<Record<string, string>>
export type Overrides = Record<string, Record<string, unknown>>

export function mergeOverrides<T extends object>(shipped: T, overrides: Overrides): T
export function flattenTranslation(locale: object): Record<string, Record<string, TranslationLeaf>>
