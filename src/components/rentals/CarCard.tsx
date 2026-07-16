'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Car } from '@/lib/data/cars'
import { useTranslation } from '@/hooks/useTranslation'
import ReservationDialog from './ReservationDialog'

interface Props {
  car: Car
  mode: 'self-drive' | 'with-driver'
  pickupDate?: string
  returnDate?: string
}

export default function CarCard({ car, mode, pickupDate, returnDate }: Props) {
  const { t } = useTranslation()
  const cc = t.carCard
  const [open, setOpen] = useState(false)

  return (
    <>
      <article className="rounded-md overflow-hidden bg-white shadow-[0_10px_26px_rgba(30,27,22,0.09)]">
        <div className="relative h-[180px] bg-tan/30">
          {car.image && <Image src={car.image} alt={car.name} fill className="object-cover" />}
        </div>
        <div className="p-5">
          <h3 className="font-display text-xl font-semibold">{car.name}</h3>
          <div className="flex flex-wrap gap-2 my-3">
            {car.tags.map((tag) => (
              <span key={tag} className="text-[11px] font-medium text-brown border border-border rounded-full px-2.5 py-1">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <span>
              <span className="font-display text-2xl">${car.pricePerDay}</span>
              <span className="text-xs text-warm-gray">{cc.per_day}</span>
            </span>
            <button onClick={() => setOpen(true)} className="bg-olive text-cream rounded-sm px-4 py-2.5 text-xs font-semibold tracking-widest uppercase">
              {cc.reserve}
            </button>
          </div>
        </div>
      </article>
      {open && (
        <ReservationDialog car={car} mode={mode} pickupDate={pickupDate} returnDate={returnDate} onClose={() => setOpen(false)} />
      )}
    </>
  )
}
