'use client'

export default function StarRatingInput({ value, onChange, label }: { value: number; onChange: (star: number) => void; label?: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-1 text-2xl">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={star === value}
          aria-label={`${star}`}
          onClick={() => onChange(star)}
          className={star <= value ? 'text-gold' : 'text-ink/15'}
        >
          ★
        </button>
      ))}
    </div>
  )
}
