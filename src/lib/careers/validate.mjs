// Client-side validation for the guide application form. Pure: no I/O, no DOM.
// Convenience only; the server validator is the authority. Keys are form-model
// paths (the shape of the values object, e.g. personal.email), values are
// message key codes. Server field hints go through normalizeServerField to land
// on the same keys.

export const MAX_FILE_BYTES = 10 * 1024 * 1024
export const MAX_FILES = 8
export const MAX_TEXT = 2000
export const MAX_REFERENCES = 5
export const MIN_AGE = 18
export const MAX_NUMBER = 1000

// Extension and declared type only; the server sniffs the bytes.
export const ALLOWED_FILE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'pdf']
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf']

export const FILE_KINDS = ['photo', 'id_card', 'driver_license', 'guide_certificate', 'cv', 'first_aid']
export const FILE_KIND_LIMITS = { guide_certificate: 3 }

export const GENDERS = ['male', 'female', 'other', 'undisclosed']
export const LOCALES = ['mn', 'en']
export const REGIONS = ['gobi', 'central', 'khuvsgul', 'western', 'eastern', 'ulaanbaatar_terelj', 'other']
export const TOUR_TYPES = [
  'private', 'group', 'vip', 'adventure_4x4', 'cultural',
  'hiking_trekking', 'festival', 'business_corporate',
]
export const TRIP_LENGTHS = ['d1_3', 'd4_7', 'd8_14', 'd15_plus']
export const LANGUAGE_CODES = ['mn', 'en', 'ko', 'zh', 'ja', 'ru', 'fr', 'es', 'other']
export const LANGUAGE_LEVELS_MN = ['native', 'good', 'intermediate']
export const LANGUAGE_LEVELS_OTHER = ['native', 'fluent', 'intermediate', 'basic']

export const DRIVING_FIELDS = [
  'has_license', 'license_class', 'years_driving', 'can_drive_4x4',
  'long_distance', 'has_own_vehicle', 'vehicles',
]

export function visibleDrivingFields(hasLicense) {
  return hasLicense === true ? [...DRIVING_FIELDS] : ['has_license']
}

const PERSONAL_FIELDS = ['full_name', 'nickname', 'phone', 'email', 'birth_date', 'gender', 'address']

// Maps a field name emitted by the backend onto the form key used here.
export function normalizeServerField(hint) {
  if (typeof hint !== 'string') return ''
  const h = hint.trim()
  if (PERSONAL_FIELDS.includes(h)) return `personal.${h}`
  if (h === 'emergency_contact') return 'personal.emergency_contact'
  if (h === 'emergency_contact.name' || h === 'emergency_contact.phone') return `personal.${h}`
  if (h === 'consent_at') return 'consent'
  if (h === 'languages.mn' || h === 'languages.en') return 'languages'
  if (h === 'driving') return 'driving.has_license'
  return h
}

const numOK = (n) => n >= 0 && n <= MAX_NUMBER
const str = (v) => (typeof v === 'string' ? v : '')
const blank = (v) => str(v).trim() === ''
const len = (v) => [...str(v)].length
const isList = (v) => (Array.isArray(v) ? v : [])

function phoneOK(s) {
  let t = str(s).trim()
  if (t.startsWith('+')) t = t.slice(1)
  let n = 0
  for (const ch of t) {
    if (ch >= '0' && ch <= '9') n++
    else if (ch !== ' ' && ch !== '-' && ch !== '(' && ch !== ')') return false
  }
  return n >= 7 && n <= 15
}

function emailOK(s) {
  const e = str(s).trim().toLowerCase()
  return /^[^\s@<>(),;:"[\]\\]+@[^\s@<>(),;:"[\]\\]+$/.test(e) && !e.includes('..') && !e.startsWith('.')
}

// Strict ISO YYYY-MM-DD only. Returns [year, month, day] or null.
function dateParts(v) {
  const plain = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str(v).trim())
  if (!plain) return null
  const y = Number(plain[1])
  const m = Number(plain[2])
  const d = Number(plain[3])
  const t = new Date(Date.UTC(y, m - 1, d))
  if (t.getUTCFullYear() !== y || t.getUTCMonth() !== m - 1 || t.getUTCDate() !== d) return null
  return [y, m, d]
}

// Calendar parts only (never AddDate-style arithmetic); time of day is ignored.
function ageOn(birth, now) {
  const [by, bm, bd] = birth
  const nm = now.getUTCMonth() + 1
  const nd = now.getUTCDate()
  let age = now.getUTCFullYear() - by
  if (nm < bm || (nm === bm && nd < bd)) age--
  return age
}

function extensionOf(name) {
  const base = str(name)
  const i = base.lastIndexOf('.')
  // No dot, or a leading-dot-only name such as ".pdf" (empty basename): no extension.
  return i <= 0 ? '' : base.slice(i + 1).toLowerCase()
}

export function validateApplication(values, files, now = new Date()) {
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) throw new TypeError('now must be a valid Date')
  const errors = {}
  const v = values ?? {}
  const p = v.personal ?? {}
  const set = (key, code) => {
    if (!(key in errors)) errors[key] = code
  }
  const cap = (key, value) => {
    if (len(value) > MAX_TEXT) set(key, 'too_long')
  }

  // personal
  if (blank(p.full_name)) set('personal.full_name', 'required')
  if (blank(p.phone)) set('personal.phone', 'required')
  else if (!phoneOK(p.phone)) set('personal.phone', 'invalid_phone')
  if (blank(p.email)) set('personal.email', 'required')
  else if (!emailOK(p.email)) set('personal.email', 'invalid_email')
  if (blank(p.birth_date)) set('personal.birth_date', 'required')
  else {
    const parts = dateParts(p.birth_date)
    if (!parts) set('personal.birth_date', 'invalid_choice')
    else if (ageOn(parts, now) < MIN_AGE) set('personal.birth_date', 'under_18')
  }
  if (!blank(p.gender) && !GENDERS.includes(p.gender)) set('personal.gender', 'invalid_choice')
  if (!blank(v.locale) && !LOCALES.includes(v.locale)) set('locale', 'invalid_choice')
  const ec = p.emergency_contact ?? {}
  cap('personal.full_name', p.full_name)
  cap('personal.nickname', p.nickname)
  cap('personal.address', p.address)
  cap('personal.emergency_contact.name', ec.name)
  cap('personal.emergency_contact.phone', ec.phone)

  // languages
  let hasMn = false
  let hasEn = false
  for (const l of isList(v.languages)) {
    const lang = l?.language
    if (!LANGUAGE_CODES.includes(lang)) {
      set('languages.language', 'invalid_choice')
      continue
    }
    const levels = lang === 'mn' ? LANGUAGE_LEVELS_MN : LANGUAGE_LEVELS_OTHER
    if (!levels.includes(l.level)) set('languages.level', 'invalid_choice')
    hasMn = hasMn || lang === 'mn'
    hasEn = hasEn || lang === 'en'
    if (lang === 'other' && blank(l.other_name)) set('languages.other_name', 'required')
    else if (lang !== 'other' && !blank(l.other_name)) set('languages.other_name', 'invalid_choice')
    cap('languages.other_name', l.other_name)
  }
  if (!hasMn || !hasEn) set('languages', 'required')

  // experience
  const e = v.experience ?? {}
  if (typeof e.years === 'number' && !numOK(e.years)) set('experience.years', 'invalid_choice')
  if (typeof e.largest_group === 'number' && !numOK(e.largest_group)) set('experience.largest_group', 'invalid_choice')
  if (isList(e.tour_types).some((t) => !TOUR_TYPES.includes(t))) set('experience.tour_types', 'invalid_choice')
  cap('experience.previous_companies', e.previous_companies)
  cap('experience.main_directions', e.main_directions)

  // regions
  const regions = isList(v.regions)
  if (regions.length === 0) set('regions', 'required')
  else if (regions.some((r) => !REGIONS.includes(r))) set('regions', 'invalid_choice')
  cap('regions_other', v.regions_other)

  // driving: details are only accepted when has_license is true
  const d = v.driving ?? {}
  if (typeof d.has_license !== 'boolean') set('driving.has_license', 'required')
  if (d.has_license !== true) {
    if (!blank(d.license_class)) set('driving.license_class', 'invalid_choice')
    if (typeof d.years_driving === 'number' && d.years_driving !== 0) set('driving.years_driving', 'invalid_choice')
    if (d.can_drive_4x4 === true) set('driving.can_drive_4x4', 'invalid_choice')
    if (d.long_distance === true) set('driving.long_distance', 'invalid_choice')
    if (d.has_own_vehicle === true) set('driving.has_own_vehicle', 'invalid_choice')
    if (!blank(d.vehicles)) set('driving.vehicles', 'invalid_choice')
  } else if (typeof d.years_driving === 'number' && !numOK(d.years_driving)) {
    set('driving.years_driving', 'invalid_choice')
  }
  cap('driving.license_class', d.license_class)
  cap('driving.vehicles', d.vehicles)

  // availability
  const av = v.availability ?? {}
  const months = isList(av.months)
  if (months.length === 0) set('availability.months', 'required')
  else if (months.some((m) => !Number.isInteger(m) || m < 1 || m > 12)) set('availability.months', 'invalid_choice')
  if (isList(av.trip_lengths).some((t) => !TRIP_LENGTHS.includes(t))) set('availability.trip_lengths', 'invalid_choice')
  cap('availability.days', av.days)
  cap('availability.booked_trips', av.booked_trips)

  // references
  const refs = isList(v.references)
  if (refs.length > MAX_REFERENCES) set('references', 'too_many')
  for (const r of refs) {
    cap('references.name', r?.name)
    cap('references.position', r?.position)
    cap('references.contact', r?.contact)
  }

  if (v.consent !== true) set('consent', 'required')

  // files
  const list = isList(files)
  if (list.length > MAX_FILES) set('files', 'file_count')
  const counts = {}
  for (const f of list) {
    if (!FILE_KINDS.includes(f?.kind)) {
      set('files.kind', 'invalid_choice')
      continue
    }
    const key = `files.${f.kind}`
    counts[f.kind] = (counts[f.kind] ?? 0) + 1
    if (counts[f.kind] > (FILE_KIND_LIMITS[f.kind] ?? 1)) set(key, 'duplicate_kind')
    // Extension only: browsers report odd MIME types; the server sniffs the bytes.
    if (!ALLOWED_FILE_EXTENSIONS.includes(extensionOf(f.name))) set(key, 'file_type')
    if (!(Number.isFinite(f.size) && f.size >= 1 && f.size <= MAX_FILE_BYTES)) set(key, 'file_size')
  }
  if (!counts.cv) set('files.cv', 'required')

  return { ok: Object.keys(errors).length === 0, errors }
}
