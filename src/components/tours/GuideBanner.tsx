import Link from 'next/link'
import type { Locale } from '@/types/i18n'
import { getTranslation } from '@/lib/translations/server'

export default async function GuideBanner({ locale }: { locale: Locale }) {
  const tr = await getTranslation(locale)
  const t = tr.guideBanner

  return (
    <section className="bg-ink text-cream">
      <div className="container mx-auto px-6 sm:px-14 py-10 flex flex-wrap items-center justify-between gap-6">
        <div className="max-w-xl">
          <p className="text-cream/75 text-xs font-semibold tracking-[0.22em] uppercase">{t.eyebrow}</p>
          <h2 className="text-cream font-display text-3xl mt-2">{t.heading}</h2>
          <p className="text-cream/85 mt-3">{t.text}</p>
        </div>
        <Link href={`/${locale}/careers`} className="bg-cream text-ink rounded-sm px-7 py-3.5 text-xs font-semibold tracking-widest uppercase">
          {t.cta}
        </Link>
      </div>
    </section>
  )
}
