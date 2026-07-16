import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { isValidLocale, getTranslation } from '@/lib/i18n'
import { getAllPartners } from '@/lib/data/partners'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'Our Partners — E & S Discovery Mongolia',
    description: 'Trusted local partners who make every journey safer and more comfortable.',
    alternates: { canonical: `/${locale}/partners` },
  }
}

export default async function PartnersIndexPage({ params }: Props) {
  const { locale } = await params
  if (!isValidLocale(locale)) notFound()

  const partners = await getAllPartners(locale)
  const t = getTranslation(locale)
  const p = t.partners

  return (
    <>
      <div className="text-center px-6 pt-12 pb-8">
        <div className="text-xs font-semibold tracking-[0.24em] uppercase text-olive">{p.eyebrow}</div>
        <h1 className="font-display text-5xl sm:text-6xl mt-3">{p.title}</h1>
      </div>

      {partners.length === 0 ? (
        <p className="text-center text-muted pb-16">—</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-7 container mx-auto px-6 sm:px-14 pb-16">
          {partners.map((partner) => (
            <Link
              key={partner.id}
              href={`/${locale}/partners/${partner.slug}`}
              className="group rounded-lg overflow-hidden bg-panel border border-border block"
            >
              <div className="relative h-[220px] bg-tan/30">
                {partner.image && (
                  <Image
                    src={partner.image}
                    alt={partner.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                )}
              </div>
              <div className="p-6">
                <p className="text-olive text-[10px] font-semibold tracking-[0.2em] uppercase mb-2">{partner.tag}</p>
                <h2 className="font-display text-2xl">{partner.title}</h2>
                <p className="text-brown text-sm leading-relaxed mt-2">{partner.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
