'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function CarSearchRail({ basePath }: { basePath: string }) {
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
        <div className="text-[10px] font-semibold tracking-widest uppercase text-warm-gray mb-2">Pick-up date</div>
        <input
          type="date"
          defaultValue={searchParams.get('pickupDate') ?? ''}
          onChange={(e) => setDate('pickupDate', e.target.value)}
          onClick={(e) => e.currentTarget.showPicker?.()}
          className="w-full border-b border-input-border text-sm py-2 outline-none cursor-pointer"
        />
      </div>
      <div className="flex-1 min-w-[150px]">
        <div className="text-[10px] font-semibold tracking-widest uppercase text-warm-gray mb-2">Return date</div>
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
