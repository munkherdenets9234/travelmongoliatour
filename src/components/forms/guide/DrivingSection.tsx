import type { CareersT } from '@/types/i18n'
import type { GuideState } from '@/lib/careers/payload.mjs'
import { visibleDrivingFields } from '@/lib/careers/validate.mjs'
import { CheckboxField, Section, TextField, YesNo, helpCls, type Errors } from './ui'

interface Props {
  t: CareersT
  index: number
  value: GuideState['driving']
  onChange: (next: GuideState['driving']) => void
  errors: Errors
}

export default function DrivingSection({ t, index, value, onChange, errors }: Props) {
  const f = t.form.fields
  const visible = visibleDrivingFields(value.has_license ?? undefined)
  const show = (name: string) => visible.includes(name)
  const text = (key: 'license_class' | 'years_driving' | 'vehicles') => (v: string) => onChange({ ...value, [key]: v })
  const flag = (key: 'can_drive_4x4' | 'long_distance' | 'has_own_vehicle') => (v: boolean) =>
    onChange({ ...value, [key]: v })

  return (
    <Section id="driving" index={index} title={t.form.sections.driving}>
      <p className={helpCls}>{t.form.help.driving}</p>
      <YesNo
        name="driving.has_license" legend={f.has_license} value={value.has_license}
        onChange={(v) => onChange({ ...value, has_license: v })}
        yes={t.form.yes} no={t.form.no} required error={errors['driving.has_license']}
      />
      {show('license_class') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <TextField
            name="driving.license_class" label={f.license_class} value={value.license_class}
            onChange={text('license_class')} placeholder={t.form.placeholders.license_class}
            error={errors['driving.license_class']}
          />
          <TextField
            name="driving.years_driving" label={f.years_driving} value={value.years_driving}
            onChange={text('years_driving')} type="number" error={errors['driving.years_driving']}
          />
        </div>
      )}
      {show('can_drive_4x4') && (
        <div className="flex flex-col gap-3">
          <CheckboxField
            name="driving.can_drive_4x4" label={f.can_drive_4x4} checked={value.can_drive_4x4}
            onChange={flag('can_drive_4x4')} error={errors['driving.can_drive_4x4']}
          />
          <CheckboxField
            name="driving.long_distance" label={f.long_distance} checked={value.long_distance}
            onChange={flag('long_distance')} error={errors['driving.long_distance']}
          />
          <CheckboxField
            name="driving.has_own_vehicle" label={f.has_own_vehicle} checked={value.has_own_vehicle}
            onChange={flag('has_own_vehicle')} error={errors['driving.has_own_vehicle']}
          />
        </div>
      )}
      {show('vehicles') && (
        <TextField
          name="driving.vehicles" label={f.vehicles} value={value.vehicles} onChange={text('vehicles')}
          placeholder={t.form.placeholders.vehicles} error={errors['driving.vehicles']}
        />
      )}
    </Section>
  )
}
