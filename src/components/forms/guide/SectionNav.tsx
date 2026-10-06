import type { CareersT } from '@/types/i18n'

export const SECTION_IDS = ['personal', 'languages', 'experience', 'knowledge', 'driving', 'availability', 'references', 'uploads'] as const

export default function SectionNav({ t }: { t: CareersT }) {
  return (
    <nav aria-label={t.form.steps_label} className="bg-white border border-tan rounded-lg p-4">
      <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
        {SECTION_IDS.map((id, i) => (
          <li key={id}>
            <a
              href={`#section-${id}`}
              className="flex items-center gap-2 py-1.5 text-sm text-brown hover:text-olive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive"
            >
              <span className="text-olive font-semibold w-5">{i + 1}.</span>
              {t.form.sections[id]}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
