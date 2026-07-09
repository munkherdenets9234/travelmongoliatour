'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { buildCalendarGrid, monthLabel, shiftMonth } from '@/lib/calendar'
import type { DepartureWithTour } from '@/lib/data/departures'
import { useTranslation } from '@/hooks/useTranslation'

interface Props {
  locale: string
  initialYear: number
  initialMonth: number
  initialItems: DepartureWithTour[]
}

export default function DepartureCalendar({ locale, initialYear, initialMonth, initialItems }: Props) {
  const { t } = useTranslation()
  const dc = t.departureCalendar
  const WEEKDAYS = dc.weekdays
  const REGIONS = dc.regions
  const [year, setYear] = useState(initialYear)
  const [month, setMonth] = useState(initialMonth)
  const [items, setItems] = useState(initialItems)
  const [region, setRegion] = useState(REGIONS[0])
  const [selectedIso, setSelectedIso] = useState<string | null>(
    initialItems[0]?.date ?? null
  )
  const [isPending, startTransition] = useTransition()

  const grid = useMemo(() => buildCalendarGrid(year, month), [year, month])

  const regionValues = ['', 'gobi', 'central', 'north', 'west']
  const filteredItems = useMemo(() => {
    const idx = REGIONS.indexOf(region)
    const value = regionValues[idx] ?? ''
    return value === '' ? items : items.filter((d) => d.tour.region === value)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, region])

  const byDate = useMemo(() => {
    const map = new Map<string, DepartureWithTour[]>()
    filteredItems.forEach((d) => {
      const list = map.get(d.date) ?? []
      list.push(d)
      map.set(d.date, list)
    })
    return map
  }, [filteredItems])

  function goToMonth(delta: number) {
    const next = shiftMonth(year, month, delta)
    setYear(next.year)
    setMonth(next.month)
    setSelectedIso(null)
    startTransition(async () => {
      const key = `${next.year}-${String(next.month).padStart(2, '0')}`
      const res = await fetch(`/api/departures?month=${key}`)
      const data = await res.json()
      setItems(data.items)
    })
  }

  const selectedDeparturesRaw = selectedIso ? byDate.get(selectedIso) ?? [] : []
  const selectedDate = selectedIso ? new Date(selectedIso + 'T00:00:00Z') : null

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-6 container mx-auto px-6 sm:px-14 pt-8 pb-1">
        <div>
          <div className="text-xs font-semibold tracking-[0.22em] uppercase text-olive">{dc.join_group_departure}</div>
          <h1 className="font-display text-5xl mt-3">
            {dc.heading_prefix} <span className="italic font-normal">{dc.heading_italic}</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => goToMonth(-1)} className="w-10 h-10 rounded-full border border-border-strong flex items-center justify-center" aria-label={dc.prev_month}>
            ‹
          </button>
          <span className="font-display text-xl min-w-[150px] text-center">{monthLabel(year, month, locale)}</span>
          <button onClick={() => goToMonth(1)} className="w-10 h-10 rounded-full border border-ink flex items-center justify-center" aria-label={dc.next_month}>
            ›
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 container mx-auto px-6 sm:px-14 pt-4">
        <span className="text-xs font-semibold tracking-widest uppercase text-warm-gray mr-1">{dc.filter}</span>
        {REGIONS.map((r) => (
          <button
            key={r}
            onClick={() => setRegion(r)}
            className={`rounded-full px-4 py-2 text-xs font-medium ${
              region === r ? 'bg-ink text-cream' : 'border border-border-strong text-brown'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 container mx-auto px-6 sm:px-14 py-6 items-start">
        <div className={`flex-[1.8] min-w-0 transition-opacity ${isPending ? 'opacity-50' : ''}`}>
          <div className="grid grid-cols-7 gap-2 mb-2">
            {WEEKDAYS.map((w) => (
              <span key={w} className="text-center text-[10px] font-semibold tracking-widest uppercase text-warm-gray">
                {w}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {grid.map((cell) => {
              const deps = byDate.get(cell.iso) ?? []
              const selected = selectedIso === cell.iso
              return (
                <button
                  key={cell.iso}
                  disabled={!cell.inMonth}
                  onClick={() => setSelectedIso(cell.iso)}
                  className={`text-left rounded-md border min-h-[88px] p-2 transition-colors ${
                    !cell.inMonth
                      ? 'bg-cream/40 border-border/60 cursor-default'
                      : selected
                        ? 'bg-panel border-2 border-olive'
                        : 'bg-white border-border hover:border-border-strong'
                  }`}
                >
                  <span className={`text-xs font-semibold ${!cell.inMonth ? 'text-border-strong' : selected ? 'text-olive' : 'text-ink'}`}>{cell.day}</span>
                  {deps.map((d) => (
                    <span
                      key={d.id}
                      className={`block mt-1.5 text-[9px] font-semibold tracking-wide rounded px-1.5 py-1 truncate ${
                        selected ? 'bg-olive text-cream' : d.status === 'full' ? 'bg-tan text-[#a9824f]' : 'bg-[#eef0e6] text-[#5f5f38]'
                      }`}
                    >
                      {d.tour.title.split(' ')[0]} · {d.status === 'full' ? dc.full.toLowerCase() : dc.open.toLowerCase()}
                    </span>
                  ))}
                </button>
              )
            })}
          </div>
        </div>

        {/* DAY PANEL */}
        <aside className="w-full lg:w-[330px] flex-none">
          <div className="bg-white border border-tan rounded-md shadow-[0_14px_34px_rgba(30,27,22,0.1)] overflow-hidden">
            <div className="relative h-[140px]">
              <Image src="/images/naadam-3.jpg" alt="" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
              {selectedDate && (
                <div className="absolute left-4 bottom-3 text-cream">
                  <div className="text-[11px] font-medium tracking-widest uppercase text-cream/85">
                    {selectedDate.toLocaleDateString(locale === 'mn' ? 'mn-MN' : 'en-US', { weekday: 'long', timeZone: 'UTC' })}
                  </div>
                  <div className="font-display text-2xl">{selectedDate.toLocaleDateString(locale === 'mn' ? 'mn-MN' : 'en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' })}</div>
                </div>
              )}
            </div>
            <div className="p-5">
              {!selectedIso ? (
                <p className="text-sm text-warm-gray">{dc.select_day}</p>
              ) : selectedDeparturesRaw.length === 0 ? (
                <p className="text-sm text-warm-gray">{dc.no_departures}</p>
              ) : (
                <>
                  <div className="text-xs font-semibold tracking-widest uppercase text-warm-gray mb-3">
                    {selectedDeparturesRaw.length} {selectedDeparturesRaw.length > 1 ? dc.departure_count_plural : dc.departure_count_singular}
                  </div>
                  <div className="flex flex-col gap-4">
                    {selectedDeparturesRaw.map((d) => (
                      <div key={d.id} className="border border-tan rounded-md p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-medium tracking-widest uppercase text-warm-gray capitalize">
                            {d.tour.region} · {d.tour.type}
                          </span>
                          <span className={`text-[10px] font-semibold tracking-wide uppercase rounded px-2 py-1 ${d.status === 'full' ? 'bg-tan text-[#a9824f]' : 'bg-[#f0e7e0] text-[#a9824f]'}`}>
                            {d.status === 'full' ? dc.full : dc.open}
                          </span>
                        </div>
                        <div className="font-display text-xl font-semibold mt-2">{d.tour.title}</div>
                        <div className="text-xs text-brown mt-1">
                          {d.tour.days} {dc.days_label} · {dc.small_group_of} {d.tour.maxTravellers} · {dc.english_speaking_guide}
                        </div>
                        <div className="flex items-baseline gap-2 my-3.5">
                          <span className="text-xs text-warm-gray">{dc.from}</span>
                          <span className="font-display text-2xl">${d.tour.price.toLocaleString()}</span>
                          <span className="text-xs text-warm-gray">{dc.per_person}</span>
                        </div>
                        <Link
                          href={`/${locale}/book?tour=${d.tour.slug}&date=${d.date}`}
                          className={`block text-center rounded-sm py-3 text-xs font-semibold tracking-widest uppercase ${
                            d.status === 'full' ? 'bg-border-strong text-white pointer-events-none' : 'bg-olive text-cream'
                          }`}
                        >
                          {d.status === 'full' ? dc.fully_booked : dc.join_departure}
                        </Link>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-4 text-xs text-muted">
                    <span className="text-olive">✓</span> {dc.confirmed_note}
                  </div>
                </>
              )}
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}
