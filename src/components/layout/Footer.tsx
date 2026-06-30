'use client'

import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'

export default function Footer() {
  const { t, locale } = useTranslation()
  const f = t.footer

  return (
    <footer className="bg-stone-950 text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full border border-amber-400/60 flex items-center justify-center">
                <span className="text-amber-400 text-xs font-bold tracking-widest">TJ</span>
              </div>
              <div>
                <div className="text-white font-semibold text-sm tracking-widest uppercase">Terelj</div>
                <div className="text-white/40 text-xs tracking-[0.2em] uppercase">Journeys</div>
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">{f.tagline}</p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white/40 text-xs tracking-widest uppercase mb-4">{f.links.company}</h4>
            <ul className="space-y-3">
              {(['destinations', 'tours', 'about', 'contact', 'journal'] as const).map((key) => (
                <li key={key}>
                  <Link
                    href={`/${locale}/${key}`}
                    className="text-white/60 hover:text-white text-sm transition-colors"
                  >
                    {f.links[key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white/40 text-xs tracking-widest uppercase mb-4">Legal</h4>
            <ul className="space-y-3">
              {(['privacy', 'terms'] as const).map((key) => (
                <li key={key}>
                  <Link href="#" className="text-white/60 hover:text-white text-sm transition-colors">
                    {f.links[key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-xs">{f.copyright}</p>
          <p className="text-white/20 text-xs">Made with ♥ in Mongolia</p>
        </div>
      </div>
    </footer>
  )
}
