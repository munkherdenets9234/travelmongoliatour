'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Re-renders the server tree every intervalMs so the waking-up screen disappears on
// its own once the backend answers. Skips ticks while the tab is hidden; the timer is
// created once per mount and cleared on unmount.
export default function AutoRetry({ label, intervalMs = 10000 }: { label: string; intervalMs?: number }) {
  const router = useRouter()

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === 'hidden') return
      router.refresh()
    }, intervalMs)
    return () => clearInterval(id)
  }, [router, intervalMs])

  return (
    <button
      type="button"
      onClick={() => router.refresh()}
      className="mt-8 inline-flex items-center justify-center rounded-full bg-gold px-6 py-3 text-sm font-semibold text-brown transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brown"
    >
      {label}
    </button>
  )
}
