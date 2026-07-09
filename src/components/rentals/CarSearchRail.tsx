'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'

export default function CarSearchRail({ basePath }: { basePath: string }) {
  const { t } = useTranslation()
  const csr = t.carSearchRail
  const router = useRouter()
  const searchParams = useSearchParams()

  function setDate(key: 'pickupDate' | 'returnDate', value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    const qs = params.toString()
    router.push(`${basePath}${qs ? `?${qs}` : ''}`, { scroll: false })
  }

  return (
    <>
      <div className="flex-1 min-w-[150px]">
        <div className="text-[10px] font-semibold tracking-widest uppercase text-warm-gray mb-2">{csr.pickup_date}</div>
        <input
          type="date"
          defaultValue={searchParams.get('pickupDate') ?? ''}
          onChange={(e) => setDate('pickupDate', e.target.value)}
          onClick={(e) => e.currentTarget.showPicker?.()}
          className="w-full border-b border-input-border text-sm py-2 outline-none cursor-pointer"
        />
      </div>
      <div className="flex-1 min-w-[150px]">
        <div className="text-[10px] font-semibold tracking-widest uppercase text-warm-gray mb-2">{csr.return_date}</div>
        <input
          type="date"
          defaultValue={searchParams.get('returnDate') ?? ''}
          onChange={(e) => setDate('returnDate', e.target.value)}
          onClick={(e) => e.currentTarget.showPicker?.()}
          className="w-full border-b border-input-border text-sm py-2 outline-none cursor-pointer"
        />
      </div>
    </>
  )
}
