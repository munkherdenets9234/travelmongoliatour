'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { validateApplication } from '@/lib/careers/validate.mjs'
import { isWakingResponse } from '@/lib/api/guard-core.mjs'
import {
  buildPayload,
  buildSubmitForm,
  emptyState,
  mapSubmitFailure,
  type FilesByKind,
  type GuideState,
} from '@/lib/careers/payload.mjs'
import SectionNav from './guide/SectionNav'
import PersonalSection from './guide/PersonalSection'
import LanguagesSection from './guide/LanguagesSection'
import { ExperienceSection, KnowledgeSection } from './guide/ExperienceSection'
import DrivingSection from './guide/DrivingSection'
import AvailabilitySection from './guide/AvailabilitySection'
import ReferencesSection from './guide/ReferencesSection'
import UploadsSection from './guide/UploadsSection'
import { CheckboxField, ErrorText, type Errors } from './guide/ui'

const FIELD_ALIASES: Record<string, string> = { 'personal.emergency_contact': 'personal.emergency_contact.name' }

// Nearest rendered field for a form key (languages.level -> languages).
function resolveField(form: HTMLFormElement, key: string): string {
  let k = FIELD_ALIASES[key] ?? key
  while (k) {
    for (const el of form.querySelectorAll<HTMLElement>('[data-field]')) if (el.dataset.field === k) return k
    const i = k.lastIndexOf('.')
    k = i > 0 ? k.slice(0, i) : ''
  }
  return ''
}

// Focuses the first rendered field (in page order) that has an error.
function focusFirst(form: HTMLFormElement, keys: string[]): boolean {
  const wanted = new Set(keys.map((k) => resolveField(form, k)).filter(Boolean))
  for (const el of form.querySelectorAll<HTMLElement>('[data-field]')) {
    if (!wanted.has(el.dataset.field ?? '')) continue
    const target = el.matches('input,select,textarea,button')
      ? el
      : (el.querySelector<HTMLElement>('input,select,textarea,button') ?? el)
    target.focus()
    target.scrollIntoView({ block: 'center' })
    return true
  }
  return false
}

export default function GuideApplicationForm() {
  const { t, locale } = useTranslation()
  const c = t.careers
  const [state, setState] = useState<GuideState>(emptyState)
  const [files, setFiles] = useState<FilesByKind>({})
  const [website, setWebsite] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [summary, setSummary] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [confirmationId, setConfirmationId] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const inFlight = useRef(false)
  const formRef = useRef<HTMLFormElement>(null)
  const summaryRef = useRef<HTMLDivElement>(null)
  const successRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (done) successRef.current?.focus()
  }, [done])

  const msg = (code: string): string => (c.errors as Record<string, string>)[code] ?? c.errors.generic
  const patch = <K extends keyof GuideState>(key: K) => (next: GuideState[K]) =>
    setState((s) => ({ ...s, [key]: next }))

  // Shows errors beside their fields, or at form level when no field matches.
  function showErrors(byKey: Record<string, string>, formLevel: string) {
    const form = formRef.current
    const keys = Object.keys(byKey)
    const placed: Errors = {}
    let loose = formLevel
    for (const k of keys) {
      if (form && resolveField(form, k)) placed[k] = byKey[k]
      else if (!loose) loose = byKey[k]
    }
    setErrors(placed)
    setSummary(Object.keys(placed).length > 0 ? c.errors.fix_errors : loose)
    if (form && Object.keys(placed).length > 0) focusFirst(form, Object.keys(placed))
    else summaryRef.current?.focus()
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (inFlight.current) return
    const payload = buildPayload(state, locale)
    const meta = Object.entries(files).flatMap(([kind, list]) =>
      list.map((f) => ({ kind, name: f.name, size: f.size, type: f.type })),
    )
    const result = validateApplication(payload, meta, new Date())
    if (!result.ok) {
      const byKey: Record<string, string> = {}
      for (const [k, code] of Object.entries(result.errors)) byKey[k] = msg(code)
      showErrors(byKey, '')
      return
    }

    inFlight.current = true
    setSubmitting(true)
    setErrors({})
    setSummary('')
    try {
      const res = await fetch('/api/guide-applications', {
        method: 'POST',
        body: buildSubmitForm(payload, files, website),
      })
      if (res.status === 201) {
        let id: string | null = null
        try {
          const body = (await res.json()) as { confirmationId?: unknown }
          if (typeof body.confirmationId === 'string') id = body.confirmationId
        } catch {
          id = null
        }
        setConfirmationId(id)
        setState(emptyState())
        setFiles({})
        setWebsite('')
        setDone(true)
        window.scrollTo({ top: 0 })
        return
      }
      let hint: unknown
      let body: unknown
      if (res.status === 400 || res.status === 422 || res.status === 503) {
        try {
          body = await res.json()
        } catch {
          body = undefined
        }
        hint = (body as { field?: unknown } | null | undefined)?.field
      }
      if (isWakingResponse(res.status, body)) {
        showErrors({}, t.serviceUnavailable.formMessage)
        return
      }
      const { code, field } = mapSubmitFailure(res.status, hint)
      showErrors(field ? { [field]: msg(code) } : {}, msg(code))
    } catch {
      showErrors({}, c.errors.generic)
    } finally {
      inFlight.current = false
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div role="status" className="max-w-lg mx-auto text-center py-10">
        <div className="text-4xl mb-4" aria-hidden="true">✓</div>
        <h2 ref={successRef} tabIndex={-1} className="font-display text-3xl mb-2 outline-none">
          {c.consent.success.heading}
        </h2>
        {confirmationId && (
          <p className="text-brown mb-1">
            {c.consent.success.referenceLabel} <span className="font-semibold">{confirmationId}</span>
          </p>
        )}
        <p className="text-warm-gray">{c.consent.success.message}</p>
      </div>
    )
  }

  return (
    <form ref={formRef} method="post" onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <SectionNav t={c} />
      <PersonalSection t={c} index={1} value={state.personal} onChange={patch('personal')} errors={errors} />
      <LanguagesSection t={c} index={2} value={state.languages} onChange={patch('languages')} errors={errors} />
      <ExperienceSection t={c} index={3} value={state.experience} onChange={patch('experience')} errors={errors} />
      <KnowledgeSection
        t={c} index={4} regions={state.regions} regionsOther={state.regions_other}
        onRegions={patch('regions')} onRegionsOther={patch('regions_other')} errors={errors}
      />
      <DrivingSection t={c} index={5} value={state.driving} onChange={patch('driving')} errors={errors} />
      <AvailabilitySection t={c} index={6} value={state.availability} onChange={patch('availability')} errors={errors} />
      <ReferencesSection t={c} index={7} value={state.references} onChange={patch('references')} errors={errors} />
      <UploadsSection t={c} index={8} files={files} onChange={setFiles} errors={errors} />

      <div className="bg-white border border-tan rounded-lg p-5 sm:p-7 flex flex-col gap-4">
        <CheckboxField
          name="consent" label={c.consent.label} checked={state.consent} required
          onChange={patch('consent')} error={errors['consent']}
        />
        <p className="text-xs text-warm-gray">{c.consent.notice}</p>
        <p className="text-xs text-warm-gray">{c.consent.required_marker}</p>

        <div ref={summaryRef} tabIndex={-1} role="alert" className="outline-none">
          {summary && <ErrorText id="gf-summary" message={summary} />}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-olive text-cream rounded-sm py-3.5 text-xs font-semibold tracking-widest uppercase disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive"
        >
          {submitting ? c.consent.submitting : c.consent.submit}
        </button>
      </div>

      {/* Honeypot: real visitors never see or fill it. */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}
      />
    </form>
  )
}
