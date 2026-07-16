import Image from 'next/image'
import type { ArticleItem } from '@/types/i18n'

interface Props {
  item: ArticleItem
  readLabel: string
}

export default function ArticleCard({ item, readLabel }: Props) {
  return (
    <article className="group cursor-pointer">
      <div className="relative overflow-hidden rounded-md aspect-[4/3] mb-4 bg-tan/30">
        {item.image && (
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        )}
      </div>
      <p className="text-olive text-[11px] font-semibold tracking-[0.16em] uppercase mb-2">{item.category}</p>
      <h3 className="text-ink text-lg font-display font-semibold leading-snug mb-3 group-hover:text-olive transition-colors">
        {item.title}
      </h3>
      <div className="flex items-center justify-between">
        <span className="text-warm-gray text-xs">{item.read_time} {readLabel}</span>
        <svg
          className="text-ink group-hover:translate-x-1 transition-transform"
          width="16" height="16" viewBox="0 0 16 16" fill="none"
        >
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </article>
  )
}
