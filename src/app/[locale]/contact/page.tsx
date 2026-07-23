import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isValidLocale, getTranslation } from '@/lib/i18n'
import ContactForm from '@/components/forms/ContactForm'

const OFFICE_ADDRESS = 'Seoul Street, Ulaanbaatar, Mongolia'
const OFFICE_ICONS = ['☎', '✉', '💬', '◎']
const OFFICE_VALUES = ['+976 9400 6739', 'info@travel-mongolia-tour.com', '+976-9400-6739', 'Seoul St, Ulaanbaatar']

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!isValidLocale(locale)) return {}
  const t = getTranslation(locale).contact
  return {
    title: t.meta_title,
    description: t.meta_description,
    alternates: { canonical: `/${locale}/contact` },
  }
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params
  if (!isValidLocale(locale)) notFound()
  const t = getTranslation(locale).contact
  const offices = t.offices.map((o, i) => ({ icon: OFFICE_ICONS[i], value: OFFICE_VALUES[i], title: o.title }))

  return (
    <>
      <div className="text-center px-6 pt-14 pb-1">
        <div className="text-xs font-semibold tracking-[0.24em] uppercase text-olive">{t.eyebrow}</div>
        <h1 className="font-display text-5xl sm:text-6xl mt-3">
          {t.heading_prefix} <span className="italic font-normal">{t.heading_italic}</span>
        </h1>
        <p className="text-brown mt-4 max-w-lg mx-auto">{t.subtext}</p>
      </div>

      <div className="max-w-[560px] mx-auto px-6 pt-9 pb-2">
        <ContactForm />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-[980px] mx-auto px-6 py-9">
        {offices.map((o) => (
          <div key={o.title} className="bg-white border border-tan rounded-md p-6 text-center">
            <div className="w-11 h-11 rounded-full border border-olive text-olive flex items-center justify-center mx-auto mb-3.5">{o.icon}</div>
            <div className="font-display text-lg font-semibold">{o.title}</div>
            <div className="text-sm text-brown mt-1.5">{o.value}</div>
          </div>
        ))}
      </div>

      <div className="relative h-[340px]">
        <iframe
          title={t.map_title}
          src={`https://maps.google.com/maps?q=${encodeURIComponent(OFFICE_ADDRESS)}&z=15&output=embed`}
          className="absolute inset-0 w-full h-full border-0 grayscale-[15%]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </>
  )
}
