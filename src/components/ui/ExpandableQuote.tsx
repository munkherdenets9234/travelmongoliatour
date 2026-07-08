'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'

export default function ExpandableQuote({ text, className }: { text: string; className?: string }) {
  const { t } = useTranslation()
  const ref = useRef<HTMLParagraphElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [overflows, setOverflows] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    setOverflows(el.scrollHeight > el.clientHeight + 1)
  }, [text])

  return (
    <div>
      <p ref={ref} className={`${className ?? ''} ${expanded ? '' : 'line-clamp-4'}`}>
        &ldquo;{text}&rdquo;
      </p>
      {overflows && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-olive text-xs font-semibold uppercase tracking-wide mt-2 hover:text-ink transition-colors"
        >
          {expanded ? t.common.read_less : t.common.read_more}
        </button>
      )}
    </div>
  )
}
