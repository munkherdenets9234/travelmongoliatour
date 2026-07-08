export default function StarRating({ value, className }: { value: number; className?: string }) {
  const filled = Math.max(0, Math.min(5, Math.round(value)))
  return (
    <span className={`text-xs tracking-[0.1em] ${className ?? ''}`}>
      <span className="text-gold">{'★'.repeat(filled)}</span>
      {filled < 5 && <span className="text-ink/15">{'★'.repeat(5 - filled)}</span>}
    </span>
  )
}
