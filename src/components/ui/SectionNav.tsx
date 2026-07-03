'use client'

import { useEffect, useState } from 'react'

interface SectionNavProps {
  sections: { id: string; label: string }[]
  title?: string
}

export function SectionNav({ sections, title = 'On this page' }: SectionNavProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id)

  useEffect(() => {
    const elements = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) {
          const topMost = visible.reduce((a, b) => (a.boundingClientRect.top < b.boundingClientRect.top ? a : b))
          setActiveId(topMost.target.id)
        }
      },
      { rootMargin: '-96px 0px -70% 0px', threshold: 0 }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [sections])

  return (
    <>
      <div className="text-xs font-semibold tracking-widest uppercase text-warm-gray mb-4">{title}</div>
      <div className="flex flex-col gap-3 text-sm font-medium">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={
              s.id === activeId
                ? 'text-ink border-l-2 border-olive pl-3 transition-colors'
                : 'text-warm-gray pl-3.5 transition-colors hover:text-ink'
            }
          >
            {s.label}
          </a>
        ))}
      </div>
    </>
  )
}
