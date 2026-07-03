import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { isValidLocale } from '@/lib/i18n'
import { SectionNav } from '@/components/ui/SectionNav'

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
          <SectionNav sections={SECTIONS} />
        </aside>

        <div className="flex-1 min-w-0 max-w-[720px] flex flex-col gap-10">
          <div id="geography" className="scroll-mt-24">
            <h2 className="font-display text-3xl mb-3.5">Geography</h2>
            <p className="text-brown leading-loose">
              From the Gobi Desert in the south to the taiga forests and glaciers of the north, Mongolia spans an astonishing range of landscapes. Vast grasslands roll toward the Altai mountains in the west, while the central steppe — the archetypal Mongolian horizon — stretches unbroken for hundreds of kilometres. It remains one of the most sparsely populated sovereign nations on earth.
            </p>
          </div>

          <div className="relative h-[300px] rounded-md overflow-hidden">
            <Image src="/images/gobi.jpg" alt="Sweeping Mongolian landscape" fill className="object-cover" />
          </div>

          <div id="climate" className="scroll-mt-24">
            <h2 className="font-display text-3xl mb-3.5">Climate &amp; seasons</h2>
            <p className="text-brown leading-loose">
              Mongolia is the world&apos;s most continental climate — long, fiercely cold winters give way to short, intense summers, with barely a spring or autumn between. Summer (June–August) brings warm days, green steppe and the Naadam festival; September paints the north gold before the first snow. Winter is spectacular but severe, dropping well below −20°C, while July highs can reach 30°C. Most travel is timed for the May–September window.
            </p>
          </div>

          <div id="history" className="scroll-mt-24">
            <h2 className="font-display text-3xl mb-3.5">History</h2>
            <p className="text-brown leading-loose">
              In 1206 Chinggis Khaan united the warring steppe tribes and forged the Mongol Empire, which at its height stretched from Korea to Hungary — the largest contiguous land empire in history. Karakorum, its capital near present-day Kharkhorin, was once the crossroads of the world. Centuries of Manchu rule and socialist alignment with the Soviet Union followed, before Mongolia&apos;s peaceful 1990 democratic revolution opened the country to the world it welcomes travellers into today.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative h-[220px] rounded-md overflow-hidden">
              <Image src="/images/kharkhorin.jpg" alt="Kharkhorin, ancient capital of the Mongol Empire" fill className="object-cover" />
            </div>
            <div className="relative h-[220px] rounded-md overflow-hidden">
              <Image src="/images/terelj.jpg" alt="Herders on horseback" fill className="object-cover" />
            </div>
          </div>

          <div id="culture" className="scroll-mt-24">
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
              <Image src="/images/kazakh-eagle-hunter.jpg" alt="Kazakh eagle hunter of western Mongolia" fill className="object-cover" />
            </div>
          </div>

          <div id="naadam" className="scroll-mt-24">
            <h2 className="font-display text-3xl mb-3.5">Naadam festival</h2>
            <p className="text-brown leading-loose">
              Held every July, Naadam is Mongolia&apos;s great national celebration — the &ldquo;three manly games&rdquo; of wrestling, archery and horse racing, staged across the country and centred on Ulaanbaatar. It is the single best week to witness the culture at full colour, and our festival departures put you in the thick of it.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative h-[220px] rounded-md overflow-hidden">
              <Image src="/images/naadam-2.jpg" alt="Naadam wrestling competition" fill className="object-cover" />
            </div>
            <div className="relative h-[220px] rounded-md overflow-hidden">
              <Image src="/images/naadam-3.jpg" alt="Naadam horse racing" fill className="object-cover" />
            </div>
          </div>

          <div id="ger" className="scroll-mt-24">
            <h2 className="font-display text-3xl mb-3.5">Ger life</h2>
            <p className="text-brown leading-loose">
              The ger — known outside Mongolia as a yurt — is a felt-and-canvas dwelling engineered for a life on the move: it can be raised or struck in under an hour, insulates against −30°C winters, and stays cool in summer. Everything inside has its place, from the stove at the centre to the honoured seat opposite the door reserved for guests. Staying in a family ger, rather than passing through as a spectator, is the heart of most of our itineraries.
            </p>
          </div>

          <div id="wildlife" className="scroll-mt-24">
            <h2 className="font-display text-3xl mb-3.5">Wildlife</h2>
            <p className="text-brown leading-loose">
              Mongolia&apos;s empty landscapes are a refuge for species that have vanished elsewhere. The Gobi shelters snow leopards, wild Bactrian camels and the reintroduced Przewalski&apos;s horse — the last truly wild horse on earth. Golden eagles are trained by Kazakh hunters in the west, while reindeer herders of the northern taiga live alongside their domesticated herds. Lake Khuvsgul and the surrounding forests hold ibex, argali sheep and elusive wolves.
            </p>
          </div>

          <div className="relative h-[300px] rounded-md overflow-hidden">
            <Image src="https://res.cloudinary.com/drttbs82q/image/upload/v1783074422/advisory_ejvnzd.jpg" alt="Lake Khuvsgul and northern Mongolia wilderness" fill className="object-cover" />
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
