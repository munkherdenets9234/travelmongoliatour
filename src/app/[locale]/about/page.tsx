import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { isValidLocale } from '@/lib/i18n'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'About Us — A Local Team Born on the Steppe — E & S Discovery Mongolia',
    description: 'Mongolian-owned and staffed since 2009 — a team of forty guides, drivers and travel designers.',
    alternates: { canonical: `/${locale}/about` },
  }
}

const STATS = [
  { value: '15+', label: 'Years guiding' },
  { value: '8,000+', label: 'Travellers hosted' },
  { value: '40', label: 'Local guides' },
  { value: '4.9★', label: 'Average rating' },
]

const VALUES = [
  { title: 'Local first', text: 'Mongolian-owned and staffed. Your trip directly supports the families and camps that host you.' },
  { title: 'Small & tailor-made', text: 'No crowds, no fixed factory itineraries. Every journey is built around you.' },
  { title: 'Light on the land', text: 'Low-impact camps and a commitment to leaving the steppe as we found it.' },
]

const CREDENTIALS = ['Mongolia Tourism', 'ASTA member', "Travellers' Choice", 'Eco-certified']

export default async function AboutPage({ params }: Props) {
  const { locale } = await params
  if (!isValidLocale(locale)) notFound()

  return (
    <>
      {/* STORY HERO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center container mx-auto px-6 sm:px-14 py-14">
        <div>
          <div className="text-xs font-semibold tracking-[0.24em] uppercase text-olive">Since 2009</div>
          <h1 className="font-display text-5xl leading-tight mt-4">
            A local team, <span className="italic font-normal">born on the steppe</span>
          </h1>
          <p className="text-brown leading-loose mt-5">
            We started with one Land Cruiser and a belief that the best way to see Mongolia is with the people who call it home. Fifteen years later we&apos;re a team of forty guides, drivers and travel designers — all Mongolian-born, all still a little in love with the horizon.
          </p>
          <p className="text-brown leading-loose mt-4">Every journey we build supports the herder families and camps we&apos;ve worked with for years.</p>
        </div>
        <div className="relative h-[420px] rounded-lg overflow-hidden">
          <Image src="/images/hero.jpg" alt="E and S Discovery Mongolia team on the steppe" fill className="object-cover" />
        </div>
      </div>

      {/* STATS */}
      <div className="bg-ink text-cream container mx-auto px-6 sm:px-14 py-11 flex flex-wrap gap-8 justify-between">
        {STATS.map((s) => (
          <div key={s.label} className="text-center flex-1 min-w-[120px]">
            <div className="font-display text-4xl text-gold">{s.value}</div>
            <div className="text-xs font-medium tracking-widest uppercase text-cream/70 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* VALUES */}
      <div className="container mx-auto px-6 sm:px-14 py-12">
        <div className="text-xs font-semibold tracking-[0.22em] uppercase text-olive text-center">What we believe</div>
        <h2 className="font-display text-3xl text-center mt-2 mb-8">How we travel</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {VALUES.map((v) => (
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
        <div className="text-xs font-semibold tracking-widest uppercase text-warm-gray mb-4">Trusted &amp; certified</div>
        <div className="flex flex-wrap gap-4">
          {CREDENTIALS.map((c) => (
            <div key={c} className="flex-1 min-w-[120px] h-[60px] border border-border rounded-md bg-white flex items-center justify-center text-xs font-medium text-border-strong">
              {c}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
