import type { CareersT } from '@/types/i18n'
import type { GuideState } from '@/lib/careers/payload.mjs'
import { LANGUAGE_CODES, LANGUAGE_LEVELS_MN, LANGUAGE_LEVELS_OTHER } from '@/lib/careers/validate.mjs'
import { Section, SelectField, TextField, ErrorText, describedBy, fieldId, helpCls, labelCls, type Errors } from './ui'

interface Props {
  t: CareersT
  index: number
  value: GuideState['languages']
  onChange: (next: GuideState['languages']) => void
  errors: Errors
}

const REQUIRED = ['mn', 'en']

export default function LanguagesSection({ t, index, value, onChange, errors }: Props) {
  const groupId = fieldId('languages')
  const groupError = errors['languages'] ?? errors['languages.language'] ?? errors['languages.level']
  const setRow = (code: string, patch: Partial<GuideState['languages'][string]>) =>
    onChange({ ...value, [code]: { ...value[code], ...patch } })

  return (
    <Section id="languages" index={index} title={t.form.sections.languages}>
      <fieldset
        data-field="languages"
        aria-invalid={groupError ? true : undefined}
        aria-describedby={describedBy(groupId, true, !!groupError)}
        className="min-w-0"
      >
        <legend className={labelCls}>{t.form.fields.language}</legend>
        <p id={`${groupId}-help`} className={`${helpCls} mb-3`}>
          {t.form.help.languages}
        </p>
        <div className="flex flex-col gap-4">
          {LANGUAGE_CODES.map((code) => {
            const row = value[code]
            const required = REQUIRED.includes(code)
            const levels = code === 'mn' ? LANGUAGE_LEVELS_MN : LANGUAGE_LEVELS_OTHER
            const levelMap = code === 'mn' ? t.options.levelMn : t.options.levelOther
            const label = `${t.options.language[code]}${required ? ' *' : ''}`
            return (
              <div key={code} className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                <SelectField
                  name={`languages.${code}.level`}
                  label={label}
                  value={row.level}
                  onChange={(v) => setRow(code, { level: v })}
                  placeholder={required ? t.form.choose : t.form.none}
                  options={levels.map((l) => ({ value: l, label: levelMap[l] }))}
                />
                {code === 'other' && (
                  <TextField
                    name="languages.other_name"
                    label={t.form.fields.other_language_name}
                    value={row.other_name}
                    onChange={(v) => setRow(code, { other_name: v })}
                    placeholder={t.form.placeholders.other_language_name}
                    error={errors['languages.other_name']}
                  />
                )}
              </div>
            )
          })}
        </div>
        <ErrorText id={`${groupId}-err`} message={groupError} />
      </fieldset>
    </Section>
  )
}
