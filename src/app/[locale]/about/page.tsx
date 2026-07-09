import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { isValidLocale, getTranslation } from '@/lib/i18n'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!isValidLocale(locale)) return {}
  const t = getTranslation(locale).about
  return {
    title: t.meta_title,
    description: t.meta_description,
    alternates: { canonical: `/${locale}/about` },
  }
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params
  if (!isValidLocale(locale)) notFound()
  const t = getTranslation(locale).about

  return (
    <>
      {/* STORY HERO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center container mx-auto px-6 sm:px-14 py-14">
        <div>
          <div className="text-xs font-semibold tracking-[0.24em] uppercase text-olive">{t.since_label}</div>
          <h1 className="font-display text-5xl leading-tight mt-4">
            {t.heading_prefix} <span className="italic font-normal">{t.heading_italic}</span>
          </h1>
          <p className="text-brown leading-loose mt-5">{t.body1}</p>
          <p className="text-brown leading-loose mt-4">{t.body2}</p>
        </div>
        <div className="relative h-[420px] rounded-lg overflow-hidden">
          <Image src="https://res.cloudinary.com/drttbs82q/image/upload/v1783078770/992cf6_89ad9d9885ce416aba51afd25a56d123_mv2_qqnpaj.avif" alt="E and S Discovery Mongolia team on the steppe" fill className="object-cover" />
        </div>
      </div>

      {/* STATS */}
      <div className="bg-ink text-cream container mx-auto px-6 sm:px-14 py-11 flex flex-wrap gap-8 justify-between">
        {t.stats.map((s) => (
          <div key={s.label} className="text-center flex-1 min-w-[120px]">
            <div className="font-display text-4xl text-gold">{s.value}</div>
            <div className="text-xs font-medium tracking-widest uppercase text-cream/70 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* VALUES */}
      <div className="container mx-auto px-6 sm:px-14 py-12">
        <div className="text-xs font-semibold tracking-[0.22em] uppercase text-olive text-center">{t.beliefs_eyebrow}</div>
        <h2 className="font-display text-3xl text-center mt-2 mb-8">{t.beliefs_heading}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {t.values.map((v) => (
            <div key={v.title}>
              <div className="w-11 h-11 rounded-full border border-olive text-olive flex items-center justify-center mb-3.5">✦</div>
              <div className="font-display text-xl font-semibold">{v.title}</div>
              <p className="text-sm text-muted leading-relaxed mt-1.5">{v.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CREDENTIALS */}
      <div className="container mx-auto px-6 sm:px-14 pb-14">
        <div className="text-xs font-semibold tracking-widest uppercase text-warm-gray mb-4">{t.credentials_heading}</div>
        <div className="flex flex-wrap gap-4">
          {t.credentials.map((c) => (
            <div key={c} className="flex-1 min-w-[120px] h-[60px] border border-border rounded-md bg-white flex items-center justify-center text-xs font-medium text-border-strong">
              {c}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
