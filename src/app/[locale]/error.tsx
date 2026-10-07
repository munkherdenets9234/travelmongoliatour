'use client'

// Keeps the layout (header, notice, footer) on screen when a page's data cannot load.
export default function LocaleError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container mx-auto px-6 py-24 text-center">
      <p className="text-ink mb-6">This page could not be loaded right now.</p>
      <button type="button" onClick={reset} className="underline">
        Try again
      </button>
    </div>
  )
}
