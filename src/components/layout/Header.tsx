'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { locales } from '@/lib/i18n'
import type { Locale } from '@/types/i18n'
import { usePathname, useRouter } from 'next/navigation'

const LOCALE_LABELS: Record<Locale, string> = { en: 'EN', mn: 'МН', ko: 'KO' }
const LOCALE_NAMES: Record<Locale, string> = { en: 'English', mn: 'Монгол', ko: '한국어' }

export default function Header() {
  const { t, locale } = useTranslation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)
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

  useEffect(() => {
    if (!langOpen) return
    function onClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [langOpen])

  function switchLocale(next: Locale) {
    const segments = pathname.split('/')
    segments[1] = next
    router.push(segments.join('/'))
    setLangOpen(false)
  }

  const navLinks = [
    { href: `/${locale}/tours`, label: t.nav.tours },
    { href: `/${locale}/about-mongolia`, label: t.nav.aboutMongolia },
    { href: `/${locale}/airport-transfers`, label: t.nav.airport },
    { href: `/${locale}/rent-a-car`, label: t.nav.carRental },
    { href: `/${locale}/journal`, label: t.nav.journal },
    // { href: `/${locale}/partners`, label: t.nav.partners },
    // { href: `/${locale}/reviews`, label: t.nav.reviews },
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
          <div ref={langRef} className="relative hidden sm:block">
            <button
              onClick={() => setLangOpen((o) => !o)}
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              className={`flex items-center gap-1.5 border rounded px-2.5 py-1.5 text-xs font-semibold tracking-widest uppercase transition-colors ${
                overlay ? 'border-cream/40 text-cream' : 'border-border-strong text-ink'
              }`}
            >
              {LOCALE_LABELS[locale]}
              <svg
                width="9"
                height="9"
                viewBox="0 0 10 10"
                fill="none"
                className={`transition-transform ${langOpen ? 'rotate-180' : ''}`}
              >
                <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {langOpen && (
              <div
                role="listbox"
                className="absolute right-0 top-full mt-2 min-w-[140px] bg-cream border border-border-strong rounded-md shadow-[0_10px_26px_rgba(30,27,22,0.12)] overflow-hidden py-1 z-50"
              >
                {locales.map((l) => (
                  <button
                    key={l}
                    role="option"
                    aria-selected={locale === l}
                    onClick={() => switchLocale(l)}
                    className={`w-full flex items-center justify-between gap-3 px-3.5 py-2 text-xs font-medium text-left transition-colors ${
                      locale === l ? 'text-olive bg-panel' : 'text-brown hover:bg-panel'
                    }`}
                  >
                    <span>{LOCALE_NAMES[l]}</span>
                    <span className="text-[10px] tracking-widest uppercase text-warm-gray">{LOCALE_LABELS[l]}</span>
                  </button>
                ))}
              </div>
            )}
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
            aria-label={t.common.menu}
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
