'use client'

import { useState, useEffect } from 'react'
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function switchLocale(next: Locale) {
    const segments = pathname.split('/')
    segments[1] = next
    router.push(segments.join('/'))
  }

  const navLinks = [
    { href: `/${locale}/destinations`, label: t.nav.destinations },
    { href: `/${locale}/tours`, label: t.nav.tours },
    { href: `/${locale}/experiences`, label: t.nav.experiences },
    { href: `/${locale}/about`, label: t.nav.about },
    { href: `/${locale}/journal`, label: t.nav.journal },
    { href: `/${locale}/contact`, label: t.nav.contact },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-stone-900/95 backdrop-blur-md py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full border border-amber-400/60 flex items-center justify-center group-hover:border-amber-400 transition-colors">
            <span className="text-amber-400 text-xs font-bold tracking-widest">TJ</span>
          </div>
          <div className="hidden sm:block">
            <div className="text-white font-semibold text-sm tracking-widest uppercase leading-tight">Terelj</div>
            <div className="text-white/60 text-xs tracking-[0.2em] uppercase">Journeys</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-white/80 hover:text-white text-xs tracking-widest uppercase transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-4">
          {/* Language switcher */}
          <div className="flex items-center gap-1 border border-white/20 rounded px-2 py-1">
            {locales.map((l, i) => (
              <button
                key={l}
                onClick={() => switchLocale(l)}
                className={`text-xs tracking-widest uppercase transition-colors px-1 ${
                  locale === l ? 'text-amber-400' : 'text-white/50 hover:text-white'
                }`}
              >
                {l === 'en' ? 'EN' : 'МН'}
                {i < locales.length - 1 && <span className="text-white/20 ml-2">/</span>}
              </button>
            ))}
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-8 h-8 flex flex-col justify-center gap-1.5 group"
            aria-label="Menu"
          >
            <span className={`block h-px bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-px bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-px bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-stone-900/98 backdrop-blur-md border-t border-white/10 mt-3">
          <nav className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-white/80 hover:text-white text-sm tracking-widest uppercase py-2 border-b border-white/10 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
