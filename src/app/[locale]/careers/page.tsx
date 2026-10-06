import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { isValidLocale } from '@/lib/i18n'
import { getTranslation } from '@/lib/translations/server'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!isValidLocale(locale)) return {}
  const t = (await getTranslation(locale)).careers
  return {
    title: t.meta.title,
    description: t.meta.description,
    alternates: { canonical: `/${locale}/careers` },
  }
}

export default async function CareersPage({ params }: Props) {
  const { locale } = await params
  if (!isValidLocale(locale)) notFound()
  const t = (await getTranslation(locale)).careers
  const o = t.opening

  return (
    <>
      <div className="text-center px-4 sm:px-6 pt-14 pb-1">
        <div className="text-xs font-semibold tracking-[0.24em] uppercase text-olive">{t.hero.eyebrow}</div>
        <h1 className="font-display text-4xl sm:text-6xl mt-3">{t.hero.title}</h1>
        <p className="text-brown mt-4 max-w-lg mx-auto">{t.hero.description}</p>
      </div>

      <div className="max-w-[720px] mx-auto px-4 sm:px-6 pt-9 pb-16">
        <article className="bg-white border border-tan rounded-lg shadow-[0_14px_34px_rgba(30,27,22,0.08)] p-6 sm:p-8">
          <div className="text-xs font-semibold tracking-[0.18em] uppercase text-olive">{o.season_label}</div>
          <h2 className="font-display text-3xl mt-2">{o.title}</h2>
          <p className="text-brown mt-3">{o.description}</p>

          <h3 className="font-semibold text-sm tracking-wide uppercase text-warm-gray mt-6 mb-3">
            {o.requirements_heading}
          </h3>
          <ul className="list-disc pl-5 space-y-2 text-brown text-sm">
            {o.requirements.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>

          <Link
            href={`/${locale}/careers/guide`}
            className="inline-block mt-7 bg-olive text-cream rounded-sm px-8 py-3.5 text-xs font-semibold tracking-widest uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive"
          >
            {o.apply}
          </Link>
        </article>
      </div>
    </>
  )
}
