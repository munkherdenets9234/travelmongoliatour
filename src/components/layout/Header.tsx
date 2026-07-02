'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { locales } from '@/lib/i18n'
import type { Locale } from '@/types/i18n'
import { usePathname, useRouter } from 'next/navigation'

export default function Header() {
  const { t, locale } = useTranslation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`
  const overlay = isHome && !scrolled

  useEffect(() => {
    if (!isHome) return
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isHome])

  function switchLocale(next: Locale) {
    const segments = pathname.split('/')
    segments[1] = next
    router.push(segments.join('/'))
  }

  const navLinks = [
    { href: `/${locale}/tours`, label: t.nav.tours },
    { href: `/${locale}/about-mongolia`, label: t.nav.aboutMongolia },
    { href: `/${locale}/airport-transfers`, label: t.nav.airport },
    { href: `/${locale}/rent-a-car`, label: t.nav.carRental },
    { href: `/${locale}/journal`, label: t.nav.journal },
    { href: `/${locale}/share-a-tour`, label: t.nav.share },
    // { href: `/${locale}/about`, label: t.nav.about },
    // { href: `/${locale}/contact`, label: t.nav.contact },
  ]

  return (
    <header
      className={`${overlay ? 'absolute' : 'sticky'} top-0 left-0 right-0 z-50 transition-colors duration-500 ${
        overlay ? 'bg-transparent py-6' : 'bg-cream/95 backdrop-blur-md border-b border-border py-4'
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-none shadow-sm">
            <Image src="/images/logo.png" alt="E and S Discovery Mongolia" width={40} height={40} className="w-full h-full object-cover" priority />
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <span className={`font-display text-lg font-semibold tracking-wide ${overlay ? 'text-cream' : 'text-ink'}`}>
              E &amp; S Discovery
            </span>
            <span className={`text-[9px] font-semibold tracking-[0.34em] uppercase mt-0.5 ${overlay ? 'text-cream/60' : 'text-warm-gray'}`}>
              Mongolia
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs font-semibold tracking-widest uppercase transition-colors pb-1 border-b-[1.5px] ${
                  active
                    ? overlay
                      ? 'text-cream border-gold'
                      : 'text-ink border-olive'
                    : overlay
                      ? 'text-cream/85 border-transparent hover:text-cream'
                      : 'text-brown border-transparent hover:text-ink'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-4">
          {/* Language switcher */}
          <div className={`hidden sm:flex items-center gap-1 border rounded px-2 py-1 ${overlay ? 'border-cream/40' : 'border-border-strong'}`}>
            {locales.map((l, i) => (
              <button
                key={l}
                onClick={() => switchLocale(l)}
                className={`text-xs font-semibold tracking-widest uppercase transition-colors px-1 ${
                  locale === l
                    ? overlay
                      ? 'text-gold'
                      : 'text-olive'
                    : overlay
                      ? 'text-cream/60 hover:text-cream'
                      : 'text-warm-gray hover:text-ink'
                }`}
              >
                {l === 'en' ? 'EN' : 'МН'}
                {i < locales.length - 1 && <span className={`ml-2 ${overlay ? 'text-cream/20' : 'text-border-strong'}`}>/</span>}
              </button>
            ))}
          </div>

          <Link
            href={`/${locale}/book`}
            className={`hidden md:inline-flex items-center justify-center rounded-sm px-5 py-2.5 text-xs font-semibold tracking-widest uppercase transition-colors ${
              overlay ? 'border border-cream/50 text-cream hover:bg-cream/10' : 'bg-ink text-cream hover:bg-ink-soft'
            }`}
          >
            {t.nav.bookCta}
          </Link>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden w-8 h-8 flex flex-col justify-center gap-1.5 group"
            aria-label="Menu"
          >
            <span className={`block h-px transition-all duration-300 ${overlay ? 'bg-cream' : 'bg-ink'} ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-px transition-all duration-300 ${overlay ? 'bg-cream' : 'bg-ink'} ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-px transition-all duration-300 ${overlay ? 'bg-cream' : 'bg-ink'} ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-cream/98 backdrop-blur-md border-t border-border mt-4">
          <nav className="container mx-auto px-6 py-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-brown hover:text-ink text-sm font-semibold tracking-widest uppercase py-2 border-b border-border transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={`/${locale}/book`}
              onClick={() => setMenuOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-sm bg-ink text-cream px-5 py-3 text-xs font-semibold tracking-widest uppercase"
            >
              {t.nav.bookCta}
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
