import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { isValidLocale } from '@/lib/i18n'
import AirportTransferForm from '@/components/forms/AirportTransferForm'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'Airport Transfers — E & S Discovery Mongolia',
    description: "A familiar face waiting at arrivals. We track your flight and wait if you're delayed.",
    alternates: { canonical: `/${locale}/airport-transfers` },
  }
}

export default async function AirportTransfersPage({ params }: Props) {
  const { locale } = await params
  if (!isValidLocale(locale)) notFound()

  return (
    <>
      <section className="relative h-[400px]">
        <Image src="/images/airport-hero.jpg" alt="Arrival in Mongolia" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/40 to-ink/10" />
        <div className="relative z-10 h-full flex flex-col justify-center container mx-auto px-6 sm:px-14 max-w-lg">
          <p className="text-cream/85 text-xs font-semibold tracking-[0.24em] uppercase">Chinggis Khaan Int&apos;l · door to door</p>
          <h1 className="text-cream text-5xl mt-4">
            Airport <span className="italic font-normal">Transfers</span>
          </h1>
          <p className="text-cream/85 mt-4">A familiar face waiting at arrivals. We track your flight and wait if you&apos;re delayed — no stress after a long journey.</p>
        </div>
      </section>

      <AirportTransferForm />

      {/* HOW IT WORKS */}
      <div className="container mx-auto px-6 sm:px-14 pb-14">
        <div className="h-px bg-border mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { n: '01', title: 'Book with your flight', text: 'Enter your flight number and we handle the rest — no need to know the address.' },
            { n: '02', title: 'We track & wait', text: 'Delayed? Your driver adjusts automatically and waits at arrivals, free of charge.' },
            { n: '03', title: 'Straight to your ger', text: 'Door-to-door to your hotel or the start of your tour, with a local who knows the way.' },
          ].map((s) => (
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
