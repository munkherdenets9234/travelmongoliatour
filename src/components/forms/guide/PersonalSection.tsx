import type { CareersT } from '@/types/i18n'
import type { GuideState } from '@/lib/careers/payload.mjs'
import { GENDERS } from '@/lib/careers/validate.mjs'
import { Section, SelectField, TextField, type Errors } from './ui'

interface Props {
  t: CareersT
  index: number
  value: GuideState['personal']
  onChange: (next: GuideState['personal']) => void
  errors: Errors
}

export default function PersonalSection({ t, index, value, onChange, errors }: Props) {
  const f = t.form.fields
  const ph = t.form.placeholders
  const set = (key: keyof GuideState['personal']) => (v: string) => onChange({ ...value, [key]: v })

  return (
    <Section id="personal" index={index} title={t.form.sections.personal}>
      <TextField
        name="personal.full_name" label={f.full_name} value={value.full_name} onChange={set('full_name')}
        placeholder={ph.full_name} help={t.form.help.full_name} error={errors['personal.full_name']}
        required autoComplete="name"
      />
      <TextField
        name="personal.nickname" label={f.nickname} value={value.nickname} onChange={set('nickname')}
        placeholder={ph.nickname} error={errors['personal.nickname']}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <TextField
          name="personal.birth_date" label={f.birth_date} value={value.birth_date} onChange={set('birth_date')}
          type="date" help={t.form.help.birth_date} error={errors['personal.birth_date']}
          required autoComplete="bday"
        />
        <SelectField
          name="personal.gender" label={f.gender} value={value.gender} onChange={set('gender')}
          placeholder={t.form.choose} error={errors['personal.gender']}
          options={GENDERS.map((g) => ({ value: g, label: t.options.gender[g] }))}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <TextField
          name="personal.phone" label={f.phone} value={value.phone} onChange={set('phone')} type="tel"
          placeholder={ph.phone} error={errors['personal.phone']} required autoComplete="tel"
        />
        <TextField
          name="personal.email" label={f.email} value={value.email} onChange={set('email')} type="email"
          placeholder={ph.email} error={errors['personal.email']} required autoComplete="email"
        />
      </div>
      <TextField
        name="personal.address" label={f.address} value={value.address} onChange={set('address')}
        placeholder={ph.address} error={errors['personal.address']} autoComplete="street-address"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <TextField
          name="personal.emergency_contact.name" label={f.emergency_name} value={value.emergency_name}
          onChange={set('emergency_name')} placeholder={ph.emergency_name}
          error={errors['personal.emergency_contact.name'] ?? errors['personal.emergency_contact']}
        />
        <TextField
          name="personal.emergency_contact.phone" label={f.emergency_phone} value={value.emergency_phone}
          onChange={set('emergency_phone')} type="tel" placeholder={ph.emergency_phone}
          error={errors['personal.emergency_contact.phone']}
        />
      </div>
    </Section>
  )
}
