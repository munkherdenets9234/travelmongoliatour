'use client'

import { createContext } from 'react'
import type { Translation } from '@/types/i18n'

export const TranslationContext = createContext<Translation | null>(null)

export default function TranslationProvider({ value, children }: { value: Translation; children: React.ReactNode }) {
  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>
}
