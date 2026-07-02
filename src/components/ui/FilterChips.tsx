import Link from 'next/link'

interface Chip {
  label: string
  href: string
  active: boolean
}

export default function FilterChips({ chips }: { chips: Chip[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <Link
          key={chip.href + chip.label}
          href={chip.href}
          className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-medium transition-colors ${
            chip.active ? 'bg-ink text-cream' : 'border border-border-strong text-brown hover:border-ink'
          }`}
        >
          {chip.label}
        </Link>
      ))}
    </div>
  )
}
