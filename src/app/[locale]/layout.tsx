import type { Metadata } from 'next'
import { Manrope, Cormorant_Garamond } from 'next/font/google'
import Script from 'next/script'
import { notFound } from 'next/navigation'
import { isValidLocale, getTranslation, locales, siteUrl } from '@/lib/i18n'
import { organizationSchema } from '@/lib/seo'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import '../globals.css'

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-manrope',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

interface Props {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!isValidLocale(locale)) return {}

  const { meta } = getTranslation(locale)
  const path = locale === 'en' ? '/en' : `/${locale}`

  return {
    metadataBase: new URL(siteUrl),
    title: meta.title,
    description: meta.description,
    icons: {
      icon: '/icon.ico',
      shortcut: '/icon.ico',
    },
    alternates: {
      canonical: path,
      languages: {
        ...Object.fromEntries(locales.map((l) => [l, `/${l}`])),
        'x-default': '/en',
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: path,
      locale,
      images: ['/images/hero.jpg'],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: ['/images/hero.jpg'],
    },
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  if (!isValidLocale(locale)) notFound()

  const t = getTranslation(locale)

  return (
    <html lang={locale} className={`${manrope.variable} ${cormorant.variable} scroll-smooth`}>
      <body className="antialiased bg-cream text-ink" style={{ fontFamily: 'var(--font-manrope)' }}>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-PBYNLSGTW7"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-PBYNLSGTW7');
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }}
        />
        <Header />
        <main>{children}</main>
        <Footer t={t} locale={locale} />
      </body>
    </html>
  )
}
