'use client'

import { useTranslation } from '@/hooks/useTranslation'
import ArticleCard from '@/components/ui/ArticleCard'

export default function JournalSection() {
  const { t } = useTranslation()
  const j = t.journal

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
          <p className="text-stone-900 text-[10px] tracking-[0.3em] uppercase font-semibold">{j.eyebrow}</p>
          <button className="text-[10px] tracking-widest uppercase text-stone-400 hover:text-stone-900 underline underline-offset-4 transition-colors">
            {j.view_all}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {j.items.map((item) => (
            <ArticleCard key={item.id} item={item} readLabel={j.read_label} />
          ))}
        </div>
      </div>
    </section>
  )
}
