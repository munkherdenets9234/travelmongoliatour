import Image from 'next/image'
import Link from 'next/link'
import type { JourneyItem } from '@/types/i18n'

interface Props {
  item: JourneyItem
  daysLabel: string
  price?: string
  href?: string
}

export default function JourneyCard({ item, daysLabel, price, href }: Props) {
  const card = (
      <article className="relative overflow-hidden rounded-md cursor-pointer h-[420px] flex-shrink-0 w-full shadow-[0_10px_26px_rgba(30,27,22,0.09)]">
        {/* Image */}
        <div className="absolute inset-0">
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />

        {/* Days badge */}
        <div className="absolute top-4 left-4 bg-cream/90 px-3 py-1.5 rounded-sm">
          <span className="text-ink text-[10px] font-semibold tracking-widest uppercase">
            {item.days} {daysLabel}
          </span>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className="text-gold">
                <path d="M5 0l1.22 3.76H10L6.9 6.09 8.09 9.85 5 7.52 1.91 9.85 3.1 6.09 0 3.76h3.78z" />
              </svg>
            ))}
            <span className="text-cream/80 text-[10px] ml-1">{item.rating.toFixed(1)}</span>
          </div>
          <h3 className="text-cream text-xl font-display font-semibold mb-1">{item.title}</h3>
          <p className="text-cream/70 text-sm mb-4 leading-relaxed line-clamp-3 whitespace-pre-line">{item.description}</p>
          <div className="flex items-center justify-between">
            {price ? (
              <span>
                <span className="text-cream/60 text-[11px]">from </span>
                <span className="text-cream font-display text-lg font-semibold">{price}</span>
              </span>
            ) : (
              <span className="text-cream/60 text-[10px] tracking-widest uppercase">{item.badge}</span>
            )}
            <div className="w-9 h-9 rounded-full bg-cream/0 border border-cream/40 flex items-center justify-center group-hover:bg-cream group-hover:border-cream transition-all duration-300">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-cream group-hover:text-ink transition-colors">
                <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </article>
  )

  if (href) {
    return (
      <Link href={href} className="group block">
        {card}
      </Link>
    )
  }

  return <div className="group block">{card}</div>
}
