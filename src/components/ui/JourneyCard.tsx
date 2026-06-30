import Image from 'next/image'
import type { JourneyItem } from '@/types/i18n'

interface Props {
  item: JourneyItem
  daysLabel: string
}

export default function JourneyCard({ item, daysLabel }: Props) {
  return (
    <article className="group relative overflow-hidden rounded-sm cursor-pointer h-[420px] flex-shrink-0 w-full">
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
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent" />

      {/* Days badge */}
      <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-sm border border-white/20 px-2.5 py-1 rounded-sm">
        <span className="text-white text-[10px] font-semibold tracking-widest uppercase">
          {item.days} {daysLabel}
        </span>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h3 className="text-white text-xl font-semibold mb-1">{item.title}</h3>
        <p className="text-white/60 text-sm mb-4 leading-relaxed">{item.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-white/50 text-[10px] tracking-widest uppercase">{item.badge}</span>
            <span className="text-white/20">·</span>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className="text-amber-400">
                  <path d="M5 0l1.22 3.76H10L6.9 6.09 8.09 9.85 5 7.52 1.91 9.85 3.1 6.09 0 3.76h3.78z" />
                </svg>
              ))}
              <span className="text-white/50 text-[10px] ml-1">{item.rating.toFixed(1)}</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all duration-300">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-white group-hover:text-stone-900 transition-colors">
              <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </article>
  )
}
