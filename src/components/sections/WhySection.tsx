import type { Translation } from '@/types/i18n'

const icons: Record<string, React.ReactNode> = {
  compass: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
    </svg>
  ),
  users: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  mountain: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3l4 8 5-5 5 15H2L8 3z" />
    </svg>
  ),
  leaf: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 014 13c0-5 3.5-7.07 7.5-6 3 .73 5.5 2.5 5.5 6.5a5 5 0 01-5 5h-1z" />
      <path d="M11 20v-3M7 10l4 10" />
    </svg>
  ),
}

export default function WhySection({ t }: { t: Translation }) {
  const w = t.why

  return (
    <section className="py-24 bg-cream">
      <div className="container mx-auto px-6">
        <p className="text-olive text-[10px] tracking-[0.3em] uppercase mb-12 text-center">{w.eyebrow}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {w.items.map((item) => (
            <div key={item.title} className="flex flex-col items-start gap-4">
              <div className="text-warm-gray">{icons[item.icon]}</div>
              <h3 className="text-ink font-semibold text-base">{item.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
