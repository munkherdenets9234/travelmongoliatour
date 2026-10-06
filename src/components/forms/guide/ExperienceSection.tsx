import type { CareersT } from '@/types/i18n'
import type { GuideState } from '@/lib/careers/payload.mjs'
import { TOUR_TYPES, REGIONS } from '@/lib/careers/validate.mjs'
import { CheckGroup, Section, TextField, toggle, type Errors } from './ui'

interface ExperienceProps {
  t: CareersT
  index: number
  value: GuideState['experience']
  onChange: (next: GuideState['experience']) => void
  errors: Errors
}

export function ExperienceSection({ t, index, value, onChange, errors }: ExperienceProps) {
  const f = t.form.fields
  const set = (key: 'years' | 'previous_companies' | 'main_directions' | 'largest_group') => (v: string) =>
    onChange({ ...value, [key]: v })

  return (
    <Section id="experience" index={index} title={t.form.sections.experience}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <TextField
          name="experience.years" label={f.years} value={value.years} onChange={set('years')} type="number"
          help={t.form.help.years} error={errors['experience.years']}
        />
        <TextField
          name="experience.largest_group" label={f.largest_group} value={value.largest_group}
          onChange={set('largest_group')} type="number" error={errors['experience.largest_group']}
        />
      </div>
      <TextField
        name="experience.previous_companies" label={f.previous_companies} value={value.previous_companies}
        onChange={set('previous_companies')} placeholder={t.form.placeholders.previous_companies}
        multiline error={errors['experience.previous_companies']}
      />
      <CheckGroup
        name="experience.tour_types" legend={f.tour_types} help={t.form.help.tour_types} columns
        options={TOUR_TYPES.map((v) => ({ value: v, label: t.options.tourType[v] }))}
        selected={value.tour_types}
        onToggle={(v) => onChange({ ...value, tour_types: toggle(value.tour_types, v) })}
        error={errors['experience.tour_types']}
      />
      <TextField
        name="experience.main_directions" label={f.main_directions} value={value.main_directions}
        onChange={set('main_directions')} placeholder={t.form.placeholders.main_directions}
        error={errors['experience.main_directions']}
      />
    </Section>
  )
}

interface KnowledgeProps {
  t: CareersT
  index: number
  regions: string[]
  regionsOther: string
  onRegions: (next: string[]) => void
  onRegionsOther: (next: string) => void
  errors: Errors
}

export function KnowledgeSection({ t, index, regions, regionsOther, onRegions, onRegionsOther, errors }: KnowledgeProps) {
  return (
    <Section id="knowledge" index={index} title={t.form.sections.knowledge}>
      <CheckGroup
        name="regions" legend={t.form.fields.regions} help={t.form.help.regions} required columns
        options={REGIONS.map((v) => ({ value: v, label: t.options.region[v] }))}
        selected={regions}
        onToggle={(v) => onRegions(toggle(regions, v))}
        error={errors['regions']}
      />
      <TextField
        name="regions_other" label={t.form.fields.regions_other} value={regionsOther}
        onChange={onRegionsOther} error={errors['regions_other']}
      />
    </Section>
  )
}
