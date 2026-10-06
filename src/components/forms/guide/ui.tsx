import type { ReactNode } from 'react'

// Error messages already resolved to text, keyed by form-model path.
export type Errors = Record<string, string>

export const inputCls =
  'w-full border border-input-border rounded-sm px-3.5 py-3 text-base sm:text-sm bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive aria-[invalid=true]:border-red-600'
export const labelCls = 'block text-sm font-medium text-brown mb-1.5'
export const helpCls = 'text-xs text-warm-gray mt-1'
const focusCls = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive'

export function fieldId(name: string): string {
  return `gf-${name.replace(/[^a-z0-9]+/gi, '-')}`
}

export function ErrorText({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="text-xs text-red-600 mt-1">
      {message}
    </p>
  )
}

export function describedBy(id: string, hasHelp: boolean, hasError: boolean): string | undefined {
  const ids = [hasHelp ? `${id}-help` : '', hasError ? `${id}-err` : ''].filter(Boolean)
  return ids.length > 0 ? ids.join(' ') : undefined
}

interface TextFieldProps {
  name: string
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  help?: string
  placeholder?: string
  required?: boolean
  type?: 'text' | 'email' | 'tel' | 'date' | 'number'
  multiline?: boolean
  autoComplete?: string
  max?: string
}

export function TextField({
  name, label, value, onChange, error, help, placeholder, required, type = 'text', multiline, autoComplete, max,
}: TextFieldProps) {
  const id = fieldId(name)
  const common = {
    id,
    'data-field': name,
    value,
    placeholder,
    autoComplete,
    'aria-required': required || undefined,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy(id, !!help, !!error),
    className: inputCls,
  }
  return (
    <div>
      <label htmlFor={id} className={labelCls}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {multiline ? (
        <textarea {...common} rows={3} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input
          {...common}
          type={type}
          max={max}
          min={type === 'number' ? 0 : undefined}
          step={type === 'number' ? 1 : undefined}
          inputMode={type === 'number' ? 'numeric' : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {help && (
        <p id={`${id}-help`} className={helpCls}>
          {help}
        </p>
      )}
      <ErrorText id={`${id}-err`} message={error} />
    </div>
  )
}

interface SelectFieldProps {
  name: string
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder: string
  error?: string
  required?: boolean
}

export function SelectField({ name, label, value, onChange, options, placeholder, error, required }: SelectFieldProps) {
  const id = fieldId(name)
  return (
    <div>
      <label htmlFor={id} className={labelCls}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <select
        id={id}
        data-field={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, false, !!error)}
        className={inputCls}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ErrorText id={`${id}-err`} message={error} />
    </div>
  )
}

interface CheckGroupProps {
  name: string
  legend: string
  options: { value: string; label: string }[]
  selected: string[]
  onToggle: (value: string) => void
  error?: string
  help?: string
  required?: boolean
  columns?: boolean
}

export function CheckGroup({ name, legend, options, selected, onToggle, error, help, required, columns }: CheckGroupProps) {
  const id = fieldId(name)
  return (
    <fieldset
      data-field={name}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(id, !!help, !!error)}
      className="min-w-0"
    >
      <legend className={labelCls}>
        {legend}
        {required && <span aria-hidden="true"> *</span>}
      </legend>
      {help && (
        <p id={`${id}-help`} className={`${helpCls} mb-2`}>
          {help}
        </p>
      )}
      <div className={columns ? 'grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2' : 'flex flex-col gap-2'}>
        {options.map((o) => (
          <label key={o.value} className="flex items-center gap-2.5 text-sm text-brown cursor-pointer min-h-8">
            <input
              type="checkbox"
              checked={selected.includes(o.value)}
              onChange={() => onToggle(o.value)}
              className={`w-5 h-5 shrink-0 accent-olive ${focusCls}`}
            />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
      <ErrorText id={`${id}-err`} message={error} />
    </fieldset>
  )
}

export function CheckboxField({
  name, label, checked, onChange, error, required,
}: { name: string; label: ReactNode; checked: boolean; onChange: (v: boolean) => void; error?: string; required?: boolean }) {
  const id = fieldId(name)
  return (
    <div>
      <label htmlFor={id} className="flex items-start gap-2.5 text-sm text-brown cursor-pointer">
        <input
          id={id}
          data-field={name}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, false, !!error)}
          className={`w-5 h-5 mt-0.5 shrink-0 accent-olive ${focusCls}`}
        />
        <span>
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </span>
      </label>
      <ErrorText id={`${id}-err`} message={error} />
    </div>
  )
}

interface YesNoProps {
  name: string
  legend: string
  value: boolean | null
  onChange: (v: boolean) => void
  yes: string
  no: string
  error?: string
  required?: boolean
}

export function YesNo({ name, legend, value, onChange, yes, no, error, required }: YesNoProps) {
  const id = fieldId(name)
  return (
    <fieldset
      data-field={name}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(id, false, !!error)}
      className="min-w-0"
    >
      <legend className={labelCls}>
        {legend}
        {required && <span aria-hidden="true"> *</span>}
      </legend>
      <div className="flex gap-6">
        {[
          { v: true, label: yes },
          { v: false, label: no },
        ].map((o) => (
          <label key={String(o.v)} className="flex items-center gap-2 text-sm text-brown cursor-pointer min-h-8">
            <input
              type="radio"
              name={id}
              checked={value === o.v}
              onChange={() => onChange(o.v)}
              className={`w-5 h-5 accent-olive ${focusCls}`}
            />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
      <ErrorText id={`${id}-err`} message={error} />
    </fieldset>
  )
}

export function Section({
  id, index, title, children,
}: { id: string; index: number; title: string; children: ReactNode }) {
  return (
    <section id={`section-${id}`} aria-labelledby={`section-${id}-h`} className="scroll-mt-24 bg-white border border-tan rounded-lg p-5 sm:p-7">
      <h2 id={`section-${id}-h`} className="font-display text-2xl mb-5">
        <span className="text-olive mr-2">{index}.</span>
        {title}
      </h2>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  )
}

export function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}
