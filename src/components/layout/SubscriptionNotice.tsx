import type { Translation } from '@/types/i18n'

// Slim notice shown above the header when the tenant's subscription has expired.
// Renders only the shipped/translated constant text, never anything from the backend.
export default function SubscriptionNotice({ t }: { t: Translation }) {
  return (
    <div role="status" className="w-full bg-gold/20 border-b border-gold text-brown">
      <p className="container mx-auto px-6 py-2 text-center text-xs sm:text-sm font-medium leading-snug">
        {t.subscription.expiredNotice}
      </p>
    </div>
  )
}
