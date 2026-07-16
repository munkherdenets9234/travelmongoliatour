import type { Locale, Translation } from '@/types/i18n'
import en from '@/locales/en.json'
import mn from '@/locales/mn.json'
import ko from '@/locales/ko.json'

const translations: Record<Locale, Translation> = {
  en: en as Translation,
  mn: mn as Translation,
  ko: ko as Translation,
}

export const locales: Locale[] = ['en', 'mn', 'ko']
export const defaultLocale: Locale = 'en'
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://discoverymongolia.com'

const INTL_LOCALES: Record<Locale, string> = {
  en: 'en-US',
  mn: 'mn-MN',
  ko: 'ko-KR',
}

export function intlLocale(locale: string): string {
  return INTL_LOCALES[locale as Locale] ?? INTL_LOCALES[defaultLocale]
}

export function getTranslation(locale: Locale): Translation {
  return translations[locale] ?? translations[defaultLocale]
}

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale)
}
