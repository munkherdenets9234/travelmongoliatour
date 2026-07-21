import Image from 'next/image'
import Link from 'next/link'
import type { Translation, Locale } from '@/types/i18n'

export default function HeroSection({ t, locale }: { t: Translation; locale: Locale }) {
  const h = t.hero

  return (
    <section className="relative -mt-20 min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Background */}
      <Image
        src="/images/hero.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-ink/20" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 pt-32 pb-48">
        <p className="text-gold/80 text-xs tracking-[0.3em] uppercase mb-6 animate-fade-in">
          {h.eyebrow}
        </p>
        <h1 className="text-cream text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95] mb-8 max-w-2xl">
          {h.title.split(' ').slice(0, 1).join(' ')}{' '}
          <br />
          {h.title.split(' ').slice(1).join(' ')}
        </h1>
        <p className="text-cream/60 text-sm sm:text-base leading-relaxed max-w-sm mb-10">
          {h.subtitle}
        </p>
        <div className="flex items-center gap-5 flex-wrap">
          <Link
            href={`/${locale}/tours`}
            className="inline-flex items-center gap-3 bg-cream text-ink px-7 py-3.5 text-xs font-semibold tracking-widest uppercase hover:bg-cream/90 transition-colors"
          >
            {h.cta_explore}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <button className="inline-flex items-center gap-3 text-cream text-xs tracking-widest uppercase group">
            <span className="w-10 h-10 rounded-full border border-cream/40 flex items-center justify-center group-hover:border-cream transition-colors">
              <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
                <path d="M1 1l10 6-10 6V1z" fill="currentColor" />
              </svg>
            </span>
            {h.cta_film}
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
        <span className="text-cream/40 text-[10px] tracking-[0.3em] uppercase">{h.scroll}</span>
        <div className="w-5 h-8 border border-cream/30 rounded-full flex justify-center pt-1.5">
          <div className="w-0.5 h-2 bg-cream/60 rounded-full animate-scroll-dot" />
        </div>
      </div>
    </section>
  )
}
