import type { Locale, Translation } from '@/types/i18n'
import en from '@/locales/en.json'
import mn from '@/locales/mn.json'

const translations: Record<Locale, Translation> = {
  en: en as Translation,
  mn: mn as Translation,
}

export const locales: Locale[] = ['en', 'mn']
export const defaultLocale: Locale = 'en'

export function getTranslation(locale: Locale): Translation {
  return translations[locale] ?? translations[defaultLocale]
}

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale)
}
