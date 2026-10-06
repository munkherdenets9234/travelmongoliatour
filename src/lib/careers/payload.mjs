// Pure helpers for the guide application form: state -> backend JSON, and the
// hand-built multipart body. No DOM, no I/O, no logging. Never use
// `new FormData(formElement)`: the backend rejects empty file parts and unknown fields.

import { LANGUAGE_CODES, FILE_KINDS, FILE_KIND_LIMITS, normalizeServerField } from './validate.mjs'

export function emptyState() {
  const languages = {}
  for (const code of LANGUAGE_CODES) languages[code] = { level: '', other_name: '' }
  return {
    personal: {
      full_name: '', nickname: '', birth_date: '', gender: '', phone: '', email: '', address: '',
      emergency_name: '', emergency_phone: '',
    },
    languages,
    experience: { years: '', previous_companies: '', main_directions: '', largest_group: '', tour_types: [] },
    regions: [],
    regions_other: '',
    driving: {
      has_license: null, license_class: '', years_driving: '', vehicles: '',
      can_drive_4x4: false, long_distance: false, has_own_vehicle: false,
    },
    availability: { months: [], days: '', trip_lengths: [], full_season: false, booked_trips: '' },
    references: [],
    consent: false,
  }
}

const trim = (v) => (typeof v === 'string' ? v.trim() : '')

// Empty or non-numeric input is omitted (the backend then stores 0).
function num(v) {
  const s = trim(v)
  if (s === '') return undefined
  const n = Number(s)
  return Number.isFinite(n) ? Math.trunc(n) : NaN // NaN is rejected by the validator
}

// Form state -> the shape validateApplication expects (the backend model, with
// `consent` still a boolean and birth_date still YYYY-MM-DD).
export function buildPayload(state, locale) {
  const p = state.personal
  const x = state.experience
  const d = state.driving
  const a = state.availability

  const languages = []
  for (const code of LANGUAGE_CODES) {
    const row = state.languages[code]
    if (!row) continue
    const other = trim(row.other_name)
    if (row.level === '') continue // inactive row; its name field is hidden, so stale text is dropped
    const entry = { language: code, level: row.level }
    if (code === 'other') entry.other_name = other
    languages.push(entry)
  }

  let driving = {}
  if (d.has_license === true) {
    driving = {
      has_license: true,
      license_class: trim(d.license_class),
      years_driving: num(d.years_driving),
      can_drive_4x4: d.can_drive_4x4 === true,
      long_distance: d.long_distance === true,
      has_own_vehicle: d.has_own_vehicle === true,
      vehicles: trim(d.vehicles),
    }
  } else if (d.has_license === false) {
    driving = { has_license: false }
  }

  const references = state.references
    .map((r) => ({ name: trim(r.name), position: trim(r.position), contact: trim(r.contact) }))
    .filter((r) => r.name !== '' || r.position !== '' || r.contact !== '')

  return {
    locale: locale === 'mn' ? 'mn' : 'en',
    consent: state.consent === true,
    personal: {
      full_name: trim(p.full_name),
      nickname: trim(p.nickname),
      birth_date: trim(p.birth_date),
      gender: p.gender,
      phone: trim(p.phone),
      email: trim(p.email),
      address: trim(p.address),
      emergency_contact: { name: trim(p.emergency_name), phone: trim(p.emergency_phone) },
    },
    languages,
    experience: {
      years: num(x.years),
      previous_companies: trim(x.previous_companies),
      tour_types: [...x.tour_types],
      main_directions: trim(x.main_directions),
      largest_group: num(x.largest_group),
    },
    regions: [...state.regions],
    ...(state.regions.includes('other') ? { regions_other: trim(state.regions_other) } : {}),
    driving,
    availability: {
      months: [...a.months].sort((m, n) => m - n),
      days: trim(a.days),
      trip_lengths: [...a.trip_lengths],
      full_season: a.full_season === true,
      booked_trips: trim(a.booked_trips),
    },
    references,
  }
}

// The backend decodes birth_date into a Go time.Time, which only accepts RFC 3339.
function birthDateForBackend(v) {
  return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? `${v}T00:00:00Z` : v
}

function usable(f) {
  return typeof f === 'object' && f !== null && typeof f.name === 'string' && f.name !== '' && f.size > 0
}

// payload: output of buildPayload. filesByKind: { kind: File[] }.
// Appends a file part only for a chosen file; `website` (honeypot) is always present.
export function buildSubmitForm(payload, filesByKind, website = '', now = new Date()) {
  const { consent, ...rest } = payload
  const data = { ...rest, personal: { ...rest.personal, birth_date: birthDateForBackend(rest.personal?.birth_date) } }
  if (consent === true) data.consent_at = now.toISOString()

  const form = new FormData()
  form.append('data', JSON.stringify(data))
  form.append('website', typeof website === 'string' ? website : '')

  for (const kind of FILE_KINDS) {
    const files = (filesByKind?.[kind] ?? []).filter(usable)
    if (kind === 'guide_certificate') {
      files.slice(0, FILE_KIND_LIMITS.guide_certificate).forEach((f, i) => {
        form.append(`file_guide_certificate_${i + 1}`, f, f.name)
      })
    } else if (files.length > 0) {
      form.append(`file_${kind}`, files[0], files[0].name)
    }
  }
  return form
}

// Maps a failed HTTP status (never the error string) to an error code and the
// form key it belongs to ('' = form level).
export function mapSubmitFailure(status, fieldHint) {
  if (status === 409) return { code: 'duplicate', field: 'personal.email' }
  if (status === 400 || status === 422) {
    const field = normalizeServerField(fieldHint)
    if (!field) return { code: 'generic', field }
    return { code: field.startsWith('files') ? 'file_unreadable' : 'invalid_choice', field }
  }
  if (status === 413) return { code: 'too_large', field: '' }
  if (status === 429) return { code: 'rate_limited', field: '' }
  if (status === 503) return { code: 'unavailable', field: '' }
  return { code: 'generic', field: '' }
}
