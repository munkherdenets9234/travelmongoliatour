import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isValidLocale } from '@/lib/i18n'
import ContactForm from '@/components/forms/ContactForm'

const OFFICE_ADDRESS = 'Seoul Street, Ulaanbaatar, Mongolia'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'Contact Us — E & S Discovery Mongolia',
    description: "Tell us what you're dreaming of and a real person on our Ulaanbaatar team will reply within a day.",
    alternates: { canonical: `/${locale}/contact` },
  }
}

const OFFICES = [
  { icon: '☎', title: 'Call', value: '+976 7000 0000' },
  { icon: '✉', title: 'Email', value: 'hello@esdiscovery.mn' },
  { icon: '◎', title: 'Visit', value: 'Seoul St, Ulaanbaatar' },
]

export default async function ContactPage({ params }: Props) {
  const { locale } = await params
  if (!isValidLocale(locale)) notFound()

  return (
    <>
      <div className="text-center px-6 pt-14 pb-1">
        <div className="text-xs font-semibold tracking-[0.24em] uppercase text-olive">We&apos;d love to hear from you</div>
        <h1 className="font-display text-5xl sm:text-6xl mt-3">
          Contact <span className="italic font-normal">us</span>
        </h1>
        <p className="text-brown mt-4 max-w-lg mx-auto">
          Tell us what you&apos;re dreaming of — a festival, a Gobi crossing, a family trip — and a real person on our Ulaanbaatar team will reply within a day.
        </p>
      </div>

      <div className="max-w-[560px] mx-auto px-6 pt-9 pb-2">
        <ContactForm />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-[820px] mx-auto px-6 py-9">
        {OFFICES.map((o) => (
          <div key={o.title} className="bg-white border border-tan rounded-md p-6 text-center">
            <div className="w-11 h-11 rounded-full border border-olive text-olive flex items-center justify-center mx-auto mb-3.5">{o.icon}</div>
            <div className="font-display text-lg font-semibold">{o.title}</div>
            <div className="text-sm text-brown mt-1.5">{o.value}</div>
          </div>
        ))}
      </div>

      <div className="relative h-[340px]">
        <iframe
          title="E and S Discovery Mongolia office location"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(OFFICE_ADDRESS)}&z=15&output=embed`}
          className="absolute inset-0 w-full h-full border-0 grayscale-[15%]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </>
  )
}
