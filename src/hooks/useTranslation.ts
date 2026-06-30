'use client'

import { useParams } from 'next/navigation'
import { getTranslation } from '@/lib/i18n'
import type { Locale, Translation } from '@/types/i18n'

export function useTranslation(): { t: Translation; locale: Locale } {
  const params = useParams()
  const locale = (params?.locale as Locale) ?? 'en'
  return { t: getTranslation(locale), locale }
}
