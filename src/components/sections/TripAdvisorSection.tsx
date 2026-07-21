import Image from 'next/image'
import type { Translation } from '@/types/i18n'

function TripAdvisorBadge() {
  return (
    <div className="relative flex items-center justify-center w-32 h-32 rounded-full bg-[#34E0A1] shadow-2xl border-4 border-white/20">
      {/* Owl eyes */}
      <svg viewBox="0 0 120 120" className="absolute inset-0 w-full h-full" aria-hidden="true">
        {/* Outer wreath leaves left */}
        <g fill="#1A7A50">
          <ellipse cx="18" cy="70" rx="7" ry="3" transform="rotate(-50 18 70)" />
          <ellipse cx="22" cy="84" rx="7" ry="3" transform="rotate(-35 22 84)" />
          <ellipse cx="30" cy="95" rx="7" ry="3" transform="rotate(-15 30 95)" />
          <ellipse cx="102" cy="70" rx="7" ry="3" transform="rotate(50 102 70)" />
          <ellipse cx="98" cy="84" rx="7" ry="3" transform="rotate(35 98 84)" />
          <ellipse cx="90" cy="95" rx="7" ry="3" transform="rotate(15 90 95)" />
        </g>
        {/* Owl face */}
        <circle cx="60" cy="55" r="22" fill="#1A7A50" />
        {/* Left eye */}
        <circle cx="51" cy="52" r="9" fill="white" />
        <circle cx="51" cy="52" r="6" fill="#1A3A2A" />
        <circle cx="53" cy="50" r="2" fill="white" />
        {/* Right eye */}
        <circle cx="69" cy="52" r="9" fill="white" />
        <circle cx="69" cy="52" r="6" fill="#1A3A2A" />
        <circle cx="71" cy="50" r="2" fill="white" />
        {/* Beak */}
        <polygon points="60,58 55,65 65,65" fill="#F5A623" />
        {/* Ears */}
        <polygon points="45,34 40,22 52,30" fill="#1A7A50" />
        <polygon points="75,34 80,22 68,30" fill="#1A7A50" />
      </svg>

      {/* Text overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-3 px-2 text-center">
        <p className="text-[#0D3B2E] font-bold text-[7px] leading-tight tracking-wide uppercase">
          Tripadvisor
        </p>
        <p className="text-[#0D3B2E] font-semibold text-[6px] leading-tight">
          Travellers&apos;
        </p>
        <p className="text-[#0D3B2E] font-semibold text-[6px] leading-tight">
          Choice Awards
        </p>
        <p className="text-[#0D3B2E] font-bold text-[8px] leading-tight mt-0.5">
          2025
        </p>
      </div>
    </div>
  )
}

export default function TripAdvisorSection({ t }: { t: Translation }) {
  const ta = t.tripadvisor

  return (
    <section className="py-8 sm:px-6 container mx-auto">
      <div className="relative overflow-hidden rounded-2xl min-h-[160px] flex flex-col items-center justify-center">
        {/* Background image */}
        <Image
          src="/images/advisory.jpg"
          alt="Mongolia landscape"
          fill
          className="object-cover"
          sizes="(max-width: 1280px) 60vw, 1152px"
        />

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center py-10 gap-4">
          {/* Badge — sits above centre */}
          <div className="-mt-4 mb-2 drop-shadow-xl">
            <TripAdvisorBadge />
          </div>

          <p className="text-cream text-base sm:text-lg font-medium px-24 leading-relaxed">
            {ta.description}
          </p>
        </div>
      </div>
    </section>
  )
}
