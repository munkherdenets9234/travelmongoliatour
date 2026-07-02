import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { isValidLocale } from '@/lib/i18n'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'About Mongolia — Land of the Eternal Blue Sky — E & S Discovery Mongolia',
    description: 'A country the size of Western Europe with fewer than 3.5 million people — geography, nomadic culture, history and wildlife.',
    alternates: { canonical: `/${locale}/about-mongolia` },
  }
}

const SECTIONS = [
  { id: 'geography', label: 'Geography' },
  { id: 'climate', label: 'Climate & seasons' },
  { id: 'culture', label: 'Nomadic culture' },
  { id: 'history', label: 'History' },
  { id: 'naadam', label: 'Naadam festival' },
  { id: 'ger', label: 'Ger life' },
  { id: 'wildlife', label: 'Wildlife' },
]

const FACTS = [
  { value: '1.56M', label: 'km² of land' },
  { value: '260+', label: 'sunny days a year' },
  { value: '~25%', label: 'still nomadic' },
  { value: '1206', label: 'Chinggis unites the tribes' },
]

export default async function AboutMongoliaPage({ params }: Props) {
  const { locale } = await params
  if (!isValidLocale(locale)) notFound()

  return (
    <>
      <section className="relative h-[420px]">
        <Image src="/images/nomadic.jpg" alt="Eternal blue sky over the steppe" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/40 to-ink/10" />
        <div className="relative z-10 h-full flex flex-col justify-center container mx-auto px-6 sm:px-14 max-w-xl">
          <p className="text-cream/85 text-xs font-semibold tracking-[0.24em] uppercase">Land of the eternal blue sky</p>
          <h1 className="text-cream text-6xl mt-4">
            About <span className="italic font-normal">Mongolia</span>
          </h1>
          <p className="text-cream/85 mt-4 max-w-md">
            A country the size of Western Europe with fewer than 3.5 million people — the last great expanse of open land, and the living heart of nomadic culture.
          </p>
        </div>
      </section>

      <div className="flex flex-col lg:flex-row gap-12 container mx-auto px-6 sm:px-14 py-11 items-start">
        <aside className="w-full lg:w-52 flex-none lg:sticky lg:top-24">
          <div className="text-xs font-semibold tracking-widest uppercase text-warm-gray mb-4">On this page</div>
          <div className="flex flex-col gap-3 text-sm font-medium">
            {SECTIONS.map((s, i) => (
              <a key={s.id} href={`#${s.id}`} className={i === 0 ? 'text-ink border-l-2 border-olive pl-3' : 'text-warm-gray pl-3.5'}>
                {s.label}
              </a>
            ))}
          </div>
        </aside>

        <div className="flex-1 min-w-0 max-w-[720px] flex flex-col gap-10">
          <div id="geography">
            <h2 className="font-display text-3xl mb-3.5">Geography</h2>
            <p className="text-brown leading-loose">
              From the Gobi Desert in the south to the taiga forests and glaciers of the north, Mongolia spans an astonishing range of landscapes. Vast grasslands roll toward the Altai mountains in the west, while the central steppe — the archetypal Mongolian horizon — stretches unbroken for hundreds of kilometres. It remains one of the most sparsely populated sovereign nations on earth.
            </p>
          </div>

          <div className="relative h-[300px] rounded-md overflow-hidden">
            <Image src="/images/gobi.jpg" alt="Sweeping Mongolian landscape" fill className="object-cover" />
          </div>

          <div id="culture">
            <h2 className="font-display text-3xl mb-3.5">Nomadic culture</h2>
            <p className="text-brown leading-loose">
              Roughly a quarter of Mongolians still live as herders, moving with the seasons between pastures. Hospitality is sacred: a traveller is always welcomed into the ger with hot salted milk tea. This rhythm of movement, family and the land shapes everything — and it is what our journeys are built to share, at the pace of the people who live it.
            </p>
            <blockquote className="mt-5 pl-5 border-l-[3px] border-olive font-display text-2xl italic leading-snug">
              &ldquo;The steppe teaches patience — the horizon is never in a hurry.&rdquo;
            </blockquote>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative h-[220px] rounded-md overflow-hidden">
              <Image src="/images/naadam-1.jpg" alt="Ger interior life" fill className="object-cover" />
            </div>
            <div className="relative h-[220px] rounded-md overflow-hidden">
              <Image src="/images/terelj.jpg" alt="Herders on horseback" fill className="object-cover" />
            </div>
          </div>

          <div id="naadam">
            <h2 className="font-display text-3xl mb-3.5">Naadam festival</h2>
            <p className="text-brown leading-loose">
              Held every July, Naadam is Mongolia&apos;s great national celebration — the &ldquo;three manly games&rdquo; of wrestling, archery and horse racing, staged across the country and centred on Ulaanbaatar. It is the single best week to witness the culture at full colour, and our festival departures put you in the thick of it.
            </p>
          </div>
        </div>
      </div>

      {/* FACTS BAND */}
      <div className="bg-ink text-cream container mx-auto px-6 sm:px-14 py-10 flex flex-wrap gap-8 justify-between">
        {FACTS.map((f) => (
          <div key={f.label}>
            <div className="font-display text-4xl text-gold">{f.value}</div>
            <div className="text-xs font-medium tracking-widest uppercase text-cream/70 mt-1">{f.label}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <section className="container mx-auto px-6 sm:px-14 py-12 flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="text-xs font-semibold tracking-[0.22em] uppercase text-olive">Ready to see it for yourself?</div>
          <div className="font-display text-3xl mt-2">
            Explore our Mongolia <span className="italic">journeys</span>.
          </div>
        </div>
        <Link href={`/${locale}/tours`} className="bg-ink text-cream rounded-sm px-7 py-3.5 text-xs font-semibold tracking-widest uppercase">
          Browse all tours →
        </Link>
      </section>
    </>
  )
}
