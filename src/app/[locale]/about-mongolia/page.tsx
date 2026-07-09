import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { isValidLocale, getTranslation } from '@/lib/i18n'
import { SectionNav } from '@/components/ui/SectionNav'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!isValidLocale(locale)) return {}
  const t = getTranslation(locale).aboutMongolia
  return {
    title: t.meta_title,
    description: t.meta_description,
    alternates: { canonical: `/${locale}/about-mongolia` },
  }
}

export default async function AboutMongoliaPage({ params }: Props) {
  const { locale } = await params
  if (!isValidLocale(locale)) notFound()
  const t = getTranslation(locale).aboutMongolia
  const nav = getTranslation(locale).sectionNav

  return (
    <>
      <section className="relative h-[420px]">
        <Image src="/images/nomadic.jpg" alt="Eternal blue sky over the steppe" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/40 to-ink/10" />
        <div className="relative z-10 h-full flex flex-col justify-center container mx-auto px-6 sm:px-14 max-w-xl">
          <p className="text-cream/85 text-xs font-semibold tracking-[0.24em] uppercase">{t.hero_eyebrow}</p>
          <h1 className="text-cream text-6xl mt-4">
            {t.hero_heading_prefix} <span className="italic font-normal">{t.hero_heading_italic}</span>
          </h1>
          <p className="text-cream/85 mt-4 max-w-md">{t.hero_subtext}</p>
        </div>
      </section>

      <div className="flex flex-col lg:flex-row gap-12 container mx-auto px-6 sm:px-14 py-11 items-start">
        <aside className="w-full lg:w-52 flex-none lg:sticky lg:top-24">
          <SectionNav sections={t.sections} title={nav.on_this_page} />
        </aside>

        <div className="flex-1 min-w-0 max-w-[720px] flex flex-col gap-10">
          <div id="geography" className="scroll-mt-24">
            <h2 className="font-display text-3xl mb-3.5">{t.geography_heading}</h2>
            <p className="text-brown leading-loose">{t.geography_body}</p>
          </div>

          <div className="relative h-[300px] rounded-md overflow-hidden">
            <Image src="/images/gobi.jpg" alt="Sweeping Mongolian landscape" fill className="object-cover" />
          </div>

          <div id="climate" className="scroll-mt-24">
            <h2 className="font-display text-3xl mb-3.5">{t.climate_heading}</h2>
            <p className="text-brown leading-loose">{t.climate_body}</p>
          </div>

          <div id="history" className="scroll-mt-24">
            <h2 className="font-display text-3xl mb-3.5">{t.history_heading}</h2>
            <p className="text-brown leading-loose">{t.history_body}</p>
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
            <h2 className="font-display text-3xl mb-3.5">{t.culture_heading}</h2>
            <p className="text-brown leading-loose">{t.culture_body}</p>
            <blockquote className="mt-5 pl-5 border-l-[3px] border-olive font-display text-2xl italic leading-snug">
              &ldquo;{t.culture_quote}&rdquo;
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
            <h2 className="font-display text-3xl mb-3.5">{t.naadam_heading}</h2>
            <p className="text-brown leading-loose">{t.naadam_body}</p>
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
            <h2 className="font-display text-3xl mb-3.5">{t.ger_heading}</h2>
            <p className="text-brown leading-loose">{t.ger_body}</p>
          </div>

          <div id="wildlife" className="scroll-mt-24">
            <h2 className="font-display text-3xl mb-3.5">{t.wildlife_heading}</h2>
            <p className="text-brown leading-loose">{t.wildlife_body}</p>
          </div>

          <div className="relative h-[300px] rounded-md overflow-hidden">
            <Image src="https://res.cloudinary.com/drttbs82q/image/upload/v1783074422/advisory_ejvnzd.jpg" alt="Lake Khuvsgul and northern Mongolia wilderness" fill className="object-cover" />
          </div>
        </div>
      </div>

      {/* FACTS BAND */}
      <div className="bg-ink text-cream container mx-auto px-6 sm:px-14 py-10 flex flex-wrap gap-8 justify-between">
        {t.facts.map((f) => (
          <div key={f.label}>
            <div className="font-display text-4xl text-gold">{f.value}</div>
            <div className="text-xs font-medium tracking-widest uppercase text-cream/70 mt-1">{f.label}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <section className="container mx-auto px-6 sm:px-14 py-12 flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="text-xs font-semibold tracking-[0.22em] uppercase text-olive">{t.cta_eyebrow}</div>
          <div className="font-display text-3xl mt-2">
            {t.cta_heading_prefix} <span className="italic">{t.cta_heading_italic}</span>
          </div>
        </div>
        <Link href={`/${locale}/tours`} className="bg-ink text-cream rounded-sm px-7 py-3.5 text-xs font-semibold tracking-widest uppercase">
          {t.cta_button}
        </Link>
      </section>
    </>
  )
}
