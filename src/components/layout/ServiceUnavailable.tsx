import type { Translation } from '@/types/i18n'
import AutoRetry from '@/components/layout/AutoRetry'

// Full-page screen shown instead of the site while the backend is waking up.
// Renders only the shipped/translated constant text, never anything from the backend.
export default function ServiceUnavailable({ t }: { t: Translation }) {
  return (
    <div
      role="status"
      className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center text-brown"
    >
      <h1 className="text-3xl sm:text-4xl font-semibold" style={{ fontFamily: 'var(--font-cormorant)' }}>
        {t.serviceUnavailable.title}
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed">{t.serviceUnavailable.body}</p>
      <AutoRetry label={t.serviceUnavailable.retry} />
    </div>
  )
}
