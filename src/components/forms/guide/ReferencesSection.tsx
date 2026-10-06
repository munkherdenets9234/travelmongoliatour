import type { CareersT } from '@/types/i18n'
import type { GuideState, ReferenceRow } from '@/lib/careers/payload.mjs'
import { MAX_REFERENCES } from '@/lib/careers/validate.mjs'
import { ErrorText, Section, TextField, fieldId, helpCls, type Errors } from './ui'

interface Props {
  t: CareersT
  index: number
  value: GuideState['references']
  onChange: (next: GuideState['references']) => void
  errors: Errors
}

const btnCls =
  'border border-input-border rounded-sm px-4 py-2.5 text-sm text-brown bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive disabled:opacity-50'

export default function ReferencesSection({ t, index, value, onChange, errors }: Props) {
  const f = t.form.fields
  const groupError = errors['references'] ?? errors['references.name'] ?? errors['references.position'] ?? errors['references.contact']
  const setRow = (i: number, patch: Partial<ReferenceRow>) =>
    onChange(value.map((r, n) => (n === i ? { ...r, ...patch } : r)))

  return (
    <Section id="references" index={index} title={`${t.form.sections.references} (${t.form.optional})`}>
      <p className={helpCls}>{t.form.help.references}</p>
      <div
        data-field="references"
        tabIndex={-1}
        role="group"
        aria-describedby={groupError ? `${fieldId('references')}-err` : undefined}
        className="flex flex-col gap-5"
      >
        {value.map((row, i) => (
          <fieldset key={i} className="border border-tan rounded-md p-4 flex flex-col gap-4 min-w-0">
            <legend className="text-sm font-medium text-brown px-1">{`${t.form.sections.references} ${i + 1}`}</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                name={`references.${i}.name`} label={f.reference_name} value={row.name}
                onChange={(v) => setRow(i, { name: v })}
              />
              <TextField
                name={`references.${i}.position`} label={f.reference_position} value={row.position}
                onChange={(v) => setRow(i, { position: v })}
              />
            </div>
            <TextField
              name={`references.${i}.contact`} label={f.reference_contact} value={row.contact}
              onChange={(v) => setRow(i, { contact: v })} placeholder={t.form.placeholders.reference_contact}
            />
            <div>
              <button type="button" className={btnCls} onClick={() => onChange(value.filter((_, n) => n !== i))}>
                {t.form.remove_row}
              </button>
            </div>
          </fieldset>
        ))}
      </div>
      <ErrorText id={`${fieldId('references')}-err`} message={groupError} />
      <div>
        <button
          type="button"
          className={btnCls}
          disabled={value.length >= MAX_REFERENCES}
          onClick={() => onChange([...value, { name: '', position: '', contact: '' }])}
        >
          {t.form.add_row}
        </button>
      </div>
    </Section>
  )
}
