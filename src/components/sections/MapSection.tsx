'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import Script from 'next/script'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import type { MapDestination } from '@/types/i18n'

export interface MapTour {
  slug: string
  title: string
  subtitle: string
  lat: number
  lng: number
}

interface GoogleMarker {
  addListener(event: string, handler: () => void): void
}
interface GoogleInfoWindow {
  open(opts: { anchor: GoogleMarker; map: unknown }): void
  close(): void
  setContent(html: string): void
}
interface GoogleMapsNamespace {
  Map: new (el: HTMLElement, opts: Record<string, unknown>) => unknown
  Marker: new (opts: Record<string, unknown>) => GoogleMarker
  InfoWindow: new (opts?: Record<string, unknown>) => GoogleInfoWindow
}
declare global {
  interface Window {
    google?: { maps: GoogleMapsNamespace }
  }
}

const MONGOLIA_CENTER = { lat: 46.8625, lng: 103.8467 }
const MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1e1b16' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#e8e2d6' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1e1b16' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#c9a24b' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f0d0a' }] },
]

export default function MapSection({ tours }: { tours: MapTour[] }) {
  const { t, locale } = useTranslation()
  const router = useRouter()
  const m = t.map
  const [hovered, setHovered] = useState<MapDestination | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  function initMap() {
    if (!mapRef.current || !window.google) return
    const map = new window.google.maps.Map(mapRef.current, {
      center: MONGOLIA_CENTER,
      zoom: 5,
      disableDefaultUI: true,
      zoomControl: true,
      styles: MAP_STYLE,
    })
    const infoWindow = new window.google.maps.InfoWindow()

    tours.forEach((tour) => {
      const marker = new window.google!.maps.Marker({
        position: { lat: tour.lat, lng: tour.lng },
        map,
        title: tour.title,
      })
      marker.addListener('mouseover', () => {
        infoWindow.setContent(
          `<div style="font:600 12px system-ui;padding:2px 2px;color:#1e1b16"><div>${tour.title}</div><div style="font-weight:400;opacity:.65;font-size:11px">${tour.subtitle}</div></div>`
        )
        infoWindow.open({ anchor: marker, map })
      })
      marker.addListener('mouseout', () => infoWindow.close())
      marker.addListener('click', () => router.push(`/${locale}/tours/${tour.slug}`))
    })
  }

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div>
            <p className="text-olive text-[10px] tracking-[0.3em] uppercase mb-6">{m.eyebrow}</p>
            <h2 className="text-ink text-4xl sm:text-5xl leading-tight mb-2">
              {m.title_line1}
              <br />
              {m.title_line2}
            </h2>
            <h2 className="text-olive text-4xl sm:text-5xl italic mb-8">{m.title_italic}</h2>
            <p className="text-muted text-sm leading-relaxed mb-10 max-w-sm">{m.description}</p>
            <a
              href={`/${locale}/about`}
              className="inline-flex items-center gap-3 text-ink text-xs font-semibold tracking-widest uppercase border-b border-ink pb-0.5 hover:text-olive hover:border-olive transition-colors"
            >
              {m.cta}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>

          {/* Map */}
          <div className="relative bg-ink rounded-md overflow-hidden aspect-[4/3]">
            {apiKey ? (
              <>
                <div ref={mapRef} className="absolute inset-0" />
                <Script
                  id="google-maps"
                  src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}`}
                  strategy="afterInteractive"
                  onReady={initMap}
                />
              </>
            ) : (
              <>
                <Image
                  src="https://res.cloudinary.com/drttbs82q/image/upload/v1783074425/mood-2_drki4k.png"
                  alt="Mongolia map"
                  fill
                  className="object-cover opacity-60"
                  sizes="50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-ink/40 to-ink/60" />

                {/* Destination pins */}
                {m.destinations.map((dest) => (
                  <button
                    key={dest.id}
                    style={{ left: `${dest.x}%`, top: `${dest.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group"
                    aria-label={`${dest.name} — ${dest.subtitle}`}
                    onMouseEnter={() => setHovered(dest)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    {/* Pulse ring */}
                    <span className="absolute inset-0 rounded-full bg-gold/30 scale-0 group-hover:scale-150 transition-transform duration-500" />
                    {/* Pin */}
                    <span className="relative flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-gold border-2 border-cream shadow-lg" />
                      <span className="hidden sm:block text-left">
                        <span className="block text-cream text-xs font-semibold leading-tight">{dest.name}</span>
                        <span className="block text-cream/50 text-[10px]">{dest.subtitle}</span>
                      </span>
                    </span>
                  </button>
                ))}

                {/* Tooltip */}
                {hovered && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-cream/10 backdrop-blur-md border border-cream/20 rounded-md px-4 py-2 text-center pointer-events-none">
                    <p className="text-cream text-sm font-semibold">{hovered.name}</p>
                    <p className="text-cream/60 text-xs">{hovered.subtitle}</p>
                  </div>
                )}

                {/* Hint */}
                <p className="absolute bottom-4 right-4 text-cream/30 text-[10px] tracking-widest uppercase">
                  {m.hover_hint}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
