'use client'

import { useContext } from 'react'
import { useParams } from 'next/navigation'
import { shippedTranslation } from '@/lib/i18n'
import { TranslationContext } from '@/components/TranslationProvider'
import type { Locale, Translation } from '@/types/i18n'

export function useTranslation(): { t: Translation; locale: Locale } {
  const params = useParams()
  const locale = (params?.locale as Locale) ?? 'en'
  const provided = useContext(TranslationContext)
  return { t: provided ?? shippedTranslation(locale), locale }
}
