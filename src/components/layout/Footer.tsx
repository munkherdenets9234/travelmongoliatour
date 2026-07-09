'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTranslation } from '@/hooks/useTranslation'

export default function Footer() {
  const { t, locale } = useTranslation()
  const f = t.footer

  const exploreLinks = [
    { key: 'tours', href: `/${locale}/tours` },
    { key: 'aboutMongolia', href: `/${locale}/about-mongolia` },
    { key: 'airportTransfer', href: `/${locale}/airport-transfers` },
    { key: 'carRental', href: `/${locale}/rent-a-car` },
    { key: 'partners', href: `/${locale}/partners` },
    { key: 'reviews', href: `/${locale}/reviews` },
  ] as const

  const companyLinks = [
    { key: 'aboutUs', href: `/${locale}/about` },
    { key: 'journal', href: `/${locale}/journal` },
    { key: 'contact', href: `/${locale}/contact` },
  ] as const

  return (
    <footer className="bg-ink text-cream">
      <div className="container mx-auto px-6 py-16">
        <div className="flex flex-wrap justify-between gap-12">
          {/* Brand */}
          <div className="max-w-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full border border-cream/50 flex items-center justify-center">
                <Image src="/images/logo.png" alt="E and S Discovery Mongolia" width={40} height={40} className="w-full h-full object-cover" priority />
                {/* <span className="font-display text-sm font-semibold">E&amp;S</span> */}
              </div>
              <span className="font-display text-lg font-semibold tracking-wide">E and S Discovery Mongolia</span>
            </div>
            <p className="text-cream/60 text-sm leading-relaxed">{f.tagline}</p>
          </div>

          <div className="flex flex-wrap gap-16">
            {/* Explore */}
            <div>
              <h4 className="text-cream/50 text-xs font-semibold tracking-widest uppercase mb-4">{f.exploreHeading}</h4>
              <ul className="space-y-3">
                {exploreLinks.map(({ key, href }) => (
                  <li key={key}>
                    <Link href={href} className="text-cream/80 hover:text-cream text-sm transition-colors">
                      {f.links[key]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-cream/50 text-xs font-semibold tracking-widest uppercase mb-4">{f.companyHeading}</h4>
              <ul className="space-y-3">
                {companyLinks.map(({ key, href }) => (
                  <li key={key}>
                    <Link href={href} className="text-cream/80 hover:text-cream text-sm transition-colors">
                      {f.links[key]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div className="max-w-[230px]">
              <h4 className="text-cream/50 text-xs font-semibold tracking-widest uppercase mb-4">{f.newsletter.heading}</h4>
              <p className="text-cream/60 text-sm leading-relaxed mb-3">{f.newsletter.text}</p>
              <form className="flex border border-cream/30 rounded-sm overflow-hidden" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder={f.newsletter.placeholder}
                  className="flex-1 min-w-0 bg-transparent px-3 py-2.5 text-sm text-cream placeholder:text-cream/50 focus:outline-none"
                />
                <button type="submit" className="bg-cream text-ink px-4 py-2.5 text-xs font-semibold" aria-label={t.common.subscribe}>
                  →
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-cream/15 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-cream/50 text-xs">{f.copyright}</p>
          <div className="flex items-center gap-5 text-cream/60 text-xs">
            <span>Instagram</span>
            <span>Facebook</span>
            <span>YouTube</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
