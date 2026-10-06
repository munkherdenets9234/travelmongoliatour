import type { CareersT } from '@/types/i18n'
import type { FilesByKind } from '@/lib/careers/payload.mjs'
import { FILE_KINDS, FILE_KIND_LIMITS, ALLOWED_FILE_EXTENSIONS } from '@/lib/careers/validate.mjs'
import { ErrorText, Section, describedBy, fieldId, helpCls, labelCls, type Errors } from './ui'

interface Props {
  t: CareersT
  index: number
  files: FilesByKind
  onChange: (next: FilesByKind) => void
  errors: Errors
}

const ACCEPT = ALLOWED_FILE_EXTENSIONS.map((e) => `.${e}`).join(',')
const REQUIRED_KINDS = ['cv']

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const btnCls =
  'border border-input-border rounded-sm px-4 py-2.5 text-sm text-brown bg-white cursor-pointer peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-olive'

export default function UploadsSection({ t, index, files, onChange, errors }: Props) {
  const ft = t.form.files
  return (
    <Section id="uploads" index={index} title={t.form.sections.uploads}>
      <p className={helpCls}>{ft.summary}</p>
      <ErrorText id={`${fieldId('files')}-err`} message={errors['files'] ?? errors['files.kind']} />
      {FILE_KINDS.map((kind) => {
        const key = `files.${kind}`
        const id = fieldId(key)
        const list = files[kind] ?? []
        const multi = (FILE_KIND_LIMITS[kind] ?? 1) > 1
        const error = errors[key]
        const required = REQUIRED_KINDS.includes(kind)
        const pick = (picked: FileList | null) => {
          if (!picked || picked.length === 0) return
          const chosen = Array.from(picked)
          onChange({ ...files, [kind]: multi ? [...list, ...chosen] : [chosen[0]] })
        }
        return (
          <div key={kind} data-field={key} tabIndex={-1} className="border border-tan rounded-md p-4">
            <span id={`${id}-label`} className={labelCls}>
              {t.options.fileKind[kind]}
              {required && (
                <span className="text-red-600 font-normal"> * {ft.required}</span>
              )}
            </span>
            <p id={`${id}-help`} className={helpCls}>
              {ft.hints[kind]}
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {list.length === 0 && <p className="text-sm text-warm-gray">{ft.no_file}</p>}
              {list.map((f, i) => (
                <div key={`${f.name}-${i}`} className="flex items-center justify-between gap-3 text-sm text-brown">
                  <span className="min-w-0 break-all">
                    {f.name} <span className="text-warm-gray">({formatSize(f.size)})</span>
                  </span>
                  <button
                    type="button"
                    className="shrink-0 text-red-600 underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive"
                    onClick={() => onChange({ ...files, [kind]: list.filter((_, n) => n !== i) })}
                  >
                    {ft.remove}
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <input
                id={id}
                type="file"
                accept={ACCEPT}
                multiple={multi}
                aria-labelledby={`${id}-label`}
                aria-describedby={describedBy(id, true, !!error)}
                aria-invalid={error ? true : undefined}
                className="peer sr-only"
                onChange={(e) => {
                  pick(e.target.files)
                  e.target.value = ''
                }}
              />
              <label htmlFor={id} className={btnCls}>
                {list.length > 0 && !multi ? ft.replace : ft.choose}
              </label>
            </div>
            <ErrorText id={`${id}-err`} message={error} />
          </div>
        )
      })}
    </Section>
  )
}
