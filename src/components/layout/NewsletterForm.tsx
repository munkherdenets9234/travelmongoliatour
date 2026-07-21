'use client'

export default function NewsletterForm({ placeholder, subscribeLabel }: { placeholder: string; subscribeLabel: string }) {
  return (
    <form className="flex border border-cream/30 rounded-sm overflow-hidden" onSubmit={(e) => e.preventDefault()}>
      <input
        type="email"
        placeholder={placeholder}
        className="flex-1 min-w-0 bg-transparent px-3 py-2.5 text-sm text-cream placeholder:text-cream/50 focus:outline-none"
      />
      <button type="submit" className="bg-cream text-ink px-4 py-2.5 text-xs font-semibold" aria-label={subscribeLabel}>
        →
      </button>
    </form>
  )
}
