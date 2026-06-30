import type { Metadata } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import { notFound } from 'next/navigation'
import { isValidLocale } from '@/lib/i18n'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import '../globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Terelj Journeys — Mongolia Beyond the Ordinary',
  description: 'Curated private journeys through endless steppes, ancient traditions and breathtaking landscapes of Mongolia.',
  openGraph: {
    title: 'Terelj Journeys',
    description: 'Mongolia Beyond the Ordinary',
    images: ['/images/hero.jpg'],
  },
}

export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'mn' }]
}

interface Props {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  if (!isValidLocale(locale)) notFound()

  return (
    <html lang={locale} className={`${inter.variable} ${cormorant.variable} scroll-smooth`}>
      <body className="antialiased bg-white text-stone-900" style={{ fontFamily: 'var(--font-inter)' }}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
