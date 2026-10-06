import type { CareersT } from '@/types/i18n'
import type { GuideState } from '@/lib/careers/payload.mjs'
import { TRIP_LENGTHS } from '@/lib/careers/validate.mjs'
import { CheckGroup, CheckboxField, Section, TextField, toggle, type Errors } from './ui'

interface Props {
  t: CareersT
  index: number
  value: GuideState['availability']
  onChange: (next: GuideState['availability']) => void
  errors: Errors
}

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

export default function AvailabilitySection({ t, index, value, onChange, errors }: Props) {
  const f = t.form.fields
  return (
    <Section id="availability" index={index} title={t.form.sections.availability}>
      <CheckGroup
        name="availability.months" legend={f.months} help={t.form.help.months} required columns
        options={MONTHS.map((m) => ({ value: String(m), label: t.options.month[String(m)] }))}
        selected={value.months.map(String)}
        onToggle={(v) => onChange({ ...value, months: toggle(value.months, Number(v)) })}
        error={errors['availability.months']}
      />
      <TextField
        name="availability.days" label={f.days} value={value.days}
        onChange={(v) => onChange({ ...value, days: v })} placeholder={t.form.placeholders.days}
        multiline error={errors['availability.days']}
      />
      <CheckGroup
        name="availability.trip_lengths" legend={f.trip_lengths} help={t.form.help.trip_lengths} columns
        options={TRIP_LENGTHS.map((v) => ({ value: v, label: t.options.tripLength[v] }))}
        selected={value.trip_lengths}
        onToggle={(v) => onChange({ ...value, trip_lengths: toggle(value.trip_lengths, v) })}
        error={errors['availability.trip_lengths']}
      />
      <CheckboxField
        name="availability.full_season" label={f.full_season} checked={value.full_season}
        onChange={(v) => onChange({ ...value, full_season: v })}
      />
      <TextField
        name="availability.booked_trips" label={f.booked_trips} value={value.booked_trips}
        onChange={(v) => onChange({ ...value, booked_trips: v })} placeholder={t.form.placeholders.booked_trips}
        multiline error={errors['availability.booked_trips']}
      />
    </Section>
  )
}
