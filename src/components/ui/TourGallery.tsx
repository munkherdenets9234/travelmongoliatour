'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useTranslation } from '@/hooks/useTranslation'

export default function TourGallery({ images, title }: { images: string[]; title: string }) {
  const { t } = useTranslation()
  const tg = t.tourGallery
  const slides = images
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState<number | null>(null)

  const go = (delta: number) => setActive((i) => (i + delta + slides.length) % slides.length)
  const goLightbox = (delta: number) =>
    setLightbox((i) => (i === null ? i : (i + delta + slides.length) % slides.length))

  useEffect(() => {
    if (lightbox === null) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowRight') goLightbox(1)
      if (e.key === 'ArrowLeft') goLightbox(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox])

  if (slides.length === 0) return null

  return (
    <div className="container mx-auto px-6 sm:px-14">
      <div className="relative rounded-md overflow-hidden h-[420px] bg-tan/30">
        <button
          type="button"
          onClick={() => setLightbox(active)}
          className="absolute inset-0 cursor-zoom-in"
          aria-label={tg.open_preview}
        >
          <Image src={slides[active]} alt={`${title} photo ${active + 1}`} fill className="object-cover" priority />
        </button>

        {slides.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label={tg.previous_photo}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-cream/90 flex items-center justify-center text-ink hover:bg-cream transition-colors"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label={tg.next_photo}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-cream/90 flex items-center justify-center text-ink hover:bg-cream transition-colors"
            >
              ›
            </button>
            <div className="absolute bottom-3 right-3 bg-ink/70 text-cream text-xs px-2.5 py-1 rounded-full">
              {active + 1} / {slides.length}
            </div>
          </>
        ) : null}
      </div>

      {slides.length > 1 ? (
        <div className="flex gap-2.5 mt-3 overflow-x-auto pb-1">
          {slides.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`${tg.view_photo} ${i + 1}`}
              aria-current={i === active}
              className={`relative flex-none w-24 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                i === active ? 'border-olive' : 'border-transparent'
              }`}
            >
              <Image src={src} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}

      {lightbox !== null ? (
        <div
          className="fixed inset-0 z-50 bg-ink/95 flex flex-col items-center justify-center p-4 sm:p-10"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} photo preview`}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            aria-label={tg.close_preview}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-cream/10 text-cream flex items-center justify-center hover:bg-cream/20 transition-colors"
          >
            ✕
          </button>

          <div className="relative w-full max-w-4xl h-[70vh]">
            <Image src={slides[lightbox]} alt={`${title} photo ${lightbox + 1}`} fill className="object-contain" />
          </div>

          {slides.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => goLightbox(-1)}
                aria-label={tg.previous_photo}
                className="absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-cream/10 text-cream flex items-center justify-center hover:bg-cream/20 transition-colors"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => goLightbox(1)}
                aria-label={tg.next_photo}
                className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-cream/10 text-cream flex items-center justify-center hover:bg-cream/20 transition-colors"
              >
                ›
              </button>
              <div className="mt-4 text-cream/80 text-xs tracking-widest uppercase">
                {lightbox + 1} / {slides.length}
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
