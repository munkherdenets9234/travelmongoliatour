import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { isValidLocale, getTranslation } from '@/lib/i18n'
import AirportTransferForm from '@/components/forms/AirportTransferForm'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!isValidLocale(locale)) return {}
  const t = getTranslation(locale).airportTransfers
  return {
    title: t.meta_title,
    description: t.meta_description,
    alternates: { canonical: `/${locale}/airport-transfers` },
  }
}

export default async function AirportTransfersPage({ params }: Props) {
  const { locale } = await params
  if (!isValidLocale(locale)) notFound()
  const t = getTranslation(locale).airportTransfers

  return (
    <>
      <section className="relative h-[400px]">
        <Image src="/images/airport-hero.jpg" alt="Arrival in Mongolia" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/40 to-ink/10" />
        <div className="relative z-10 h-full flex flex-col justify-center container mx-auto px-6 sm:px-14 max-w-lg">
          <p className="text-cream/85 text-xs font-semibold tracking-[0.24em] uppercase">{t.hero_eyebrow}</p>
          <h1 className="text-cream text-5xl mt-4">
            {t.hero_heading_prefix} <span className="italic font-normal">{t.hero_heading_italic}</span>
          </h1>
          <p className="text-cream/85 mt-4">{t.hero_subtext}</p>
        </div>
      </section>

      <AirportTransferForm />

      {/* HOW IT WORKS */}
      <div className="container mx-auto px-6 sm:px-14 pb-14">
        <div className="h-px bg-border mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {t.steps.map((s) => (
            <div key={s.n}>
              <div className="font-display text-3xl text-olive">{s.n}</div>
              <div className="font-display text-lg font-semibold mt-1.5 mb-1">{s.title}</div>
              <p className="text-sm text-muted leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
