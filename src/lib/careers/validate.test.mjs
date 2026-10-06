import test from 'node:test'
import assert from 'node:assert/strict'
import {
  validateApplication,
  visibleDrivingFields,
  MAX_FILE_BYTES,
  MAX_FILES,
  MAX_TEXT,
  ALLOWED_FILE_EXTENSIONS,
  FILE_KINDS,
  REGIONS,
  TOUR_TYPES,
  TRIP_LENGTHS,
  LANGUAGE_CODES,
  normalizeServerField,
  LANGUAGE_LEVELS_MN,
  LANGUAGE_LEVELS_OTHER,
} from './validate.mjs'

const NOW = new Date('2026-10-06T12:00:00Z')

function validValues() {
  return {
    locale: 'mn',
    consent: true,
    personal: {
      full_name: 'Бат-Эрдэнэ Мөнхбаяр',
      nickname: 'Bat',
      birth_date: '1995-05-20',
      gender: 'male',
      phone: '+976 9400 6739',
      email: 'Bat@Example.com',
      address: 'Ulaanbaatar',
      emergency_contact: { name: 'Sarnai', phone: '99112233' },
    },
    languages: [
      { language: 'mn', level: 'native' },
      { language: 'en', level: 'fluent' },
    ],
    experience: { years: 3, previous_companies: 'X', tour_types: ['private', 'group'], main_directions: 'Gobi', largest_group: 12 },
    regions: ['gobi', 'central'],
    regions_other: '',
    driving: { has_license: false },
    availability: { months: [6, 7, 8], days: '', trip_lengths: ['d4_7'], full_season: false, booked_trips: '' },
    references: [{ name: 'A', position: 'B', contact: 'C' }],
  }
}

const validFiles = () => [{ kind: 'cv', name: 'cv.pdf', size: 1000, type: 'application/pdf' }]

const run = (mutate, files = validFiles(), now = NOW) => {
  const v = validValues()
  mutate?.(v)
  return validateApplication(v, files, now)
}

test('a fully valid application returns ok with no errors', () => {
  assert.deepEqual(validateApplication(validValues(), validFiles(), NOW), { ok: true, errors: {} })
})

test('Mongolian Cyrillic name and +976 9400 6739 phone are accepted', () => {
  const r = run((v) => {
    v.personal.full_name = 'Бат-Эрдэнэ Мөнхбаяр'
    v.personal.phone = '+976 9400 6739'
  })
  assert.equal(r.ok, true)
})

test('each required field missing in turn yields required on its path', () => {
  const cases = [
    ['personal.full_name', (v) => { v.personal.full_name = '  ' }],
    ['personal.phone', (v) => { v.personal.phone = '' }],
    ['personal.email', (v) => { v.personal.email = '' }],
    ['personal.birth_date', (v) => { v.personal.birth_date = '' }],
    ['regions', (v) => { v.regions = [] }],
    ['availability.months', (v) => { v.availability.months = [] }],
    ['consent', (v) => { v.consent = false }],
    ['languages', (v) => { v.languages = [{ language: 'en', level: 'fluent' }] }],
    ['languages', (v) => { v.languages = [{ language: 'mn', level: 'native' }] }],
  ]
  for (const [key, mutate] of cases) {
    const r = run(mutate)
    assert.equal(r.ok, false, key)
    assert.equal(r.errors[key], 'required', key)
  }
})

test('invalid email and phone formats', () => {
  assert.equal(run((v) => { v.personal.email = 'nope' }).errors['personal.email'], 'invalid_email')
  assert.equal(run((v) => { v.personal.email = 'a b@c.com' }).errors['personal.email'], 'invalid_email')
  assert.equal(run((v) => { v.personal.phone = '12345' }).errors['personal.phone'], 'invalid_phone')
  assert.equal(run((v) => { v.personal.phone = '1234567890123456' }).errors['personal.phone'], 'invalid_phone')
  assert.equal(run((v) => { v.personal.phone = '9400-abcd' }).errors['personal.phone'], 'invalid_phone')
  assert.equal(run((v) => { v.personal.phone = '(976) 9400-6739' }).ok, true)
})

test('age boundary: exactly 18 accepted, one day short rejected', () => {
  const now = new Date('2026-10-06T00:00:00Z')
  assert.equal(run((v) => { v.personal.birth_date = '2008-10-06' }, validFiles(), now).ok, true)
  assert.equal(run((v) => { v.personal.birth_date = '2008-10-07' }, validFiles(), now).errors['personal.birth_date'], 'under_18')
  assert.equal(run((v) => { v.personal.birth_date = '2008-10-05' }, validFiles(), now).ok, true)
})

test('age: leap day 2028-02-29 with birth 2010-03-01 is under 18, 2010-02-28 is accepted', () => {
  const now = new Date('2028-02-29T10:00:00Z')
  assert.equal(run((v) => { v.personal.birth_date = '2010-03-01' }, validFiles(), now).errors['personal.birth_date'], 'under_18')
  assert.equal(run((v) => { v.personal.birth_date = '2010-02-28' }, validFiles(), now).ok, true)
})

test('age: time of day is ignored', () => {
  const lateNight = new Date('2026-10-06T23:59:59Z')
  const early = new Date('2026-10-06T00:00:00Z')
  const set = (v) => { v.personal.birth_date = '2008-10-06' }
  assert.equal(run(set, validFiles(), lateNight).ok, true)
  assert.equal(run(set, validFiles(), early).ok, true)
  const dayBefore = new Date('2026-10-05T23:59:59Z')
  assert.equal(run(set, validFiles(), dayBefore).errors['personal.birth_date'], 'under_18')
})

test('future and unparseable birth dates are rejected', () => {
  assert.equal(run((v) => { v.personal.birth_date = '2030-01-01' }).errors['personal.birth_date'], 'under_18')
  assert.equal(run((v) => { v.personal.birth_date = '2000-02-31' }).errors['personal.birth_date'], 'invalid_choice')
  assert.equal(run((v) => { v.personal.birth_date = 'garbage' }).errors['personal.birth_date'], 'invalid_choice')
})

test('unknown enum values are invalid_choice', () => {
  assert.equal(run((v) => { v.personal.gender = 'x' }).errors['personal.gender'], 'invalid_choice')
  assert.equal(run((v) => { v.locale = 'de' }).errors.locale, 'invalid_choice')
  assert.equal(run((v) => { v.regions = ['gobi', 'mars'] }).errors.regions, 'invalid_choice')
  assert.equal(run((v) => { v.experience.tour_types = ['nope'] }).errors['experience.tour_types'], 'invalid_choice')
  assert.equal(run((v) => { v.availability.trip_lengths = ['d99'] }).errors['availability.trip_lengths'], 'invalid_choice')
  assert.equal(run((v) => { v.availability.months = [0] }).errors['availability.months'], 'invalid_choice')
  assert.equal(run((v) => { v.availability.months = [13] }).errors['availability.months'], 'invalid_choice')
  assert.equal(run((v) => { v.languages.push({ language: 'xx', level: 'native' }) }).errors['languages.language'], 'invalid_choice')
})

test('language levels differ for Mongolian and other languages', () => {
  assert.equal(run((v) => { v.languages[0].level = 'fluent' }).errors['languages.level'], 'invalid_choice')
  assert.equal(run((v) => { v.languages[1].level = 'good' }).errors['languages.level'], 'invalid_choice')
  assert.equal(run((v) => { v.languages[0].level = 'good' }).ok, true)
  assert.equal(run((v) => { v.languages[1].level = 'basic' }).ok, true)
})

test('language other needs a non-blank other_name', () => {
  assert.equal(
    run((v) => { v.languages.push({ language: 'other', level: 'basic' }) }).errors['languages.other_name'],
    'required',
  )
  assert.equal(
    run((v) => { v.languages.push({ language: 'other', other_name: '   ', level: 'basic' }) }).errors['languages.other_name'],
    'required',
  )
  assert.equal(run((v) => { v.languages.push({ language: 'other', other_name: 'German', level: 'basic' }) }).ok, true)
})

test('visibleDrivingFields hides details when there is no licence', () => {
  assert.deepEqual(visibleDrivingFields(false), ['has_license'])
  assert.deepEqual(visibleDrivingFields(undefined), ['has_license'])
  const all = visibleDrivingFields(true)
  for (const f of ['has_license', 'license_class', 'years_driving', 'can_drive_4x4', 'long_distance', 'has_own_vehicle', 'vehicles']) {
    assert.ok(all.includes(f), f)
  }
})

test('stray driving details with has_license=false error on that path', () => {
  assert.equal(
    run((v) => { v.driving = { has_license: false, license_class: 'B' } }).errors['driving.license_class'],
    'invalid_choice',
  )
  assert.equal(run((v) => { v.driving = { has_license: false, can_drive_4x4: true } }).errors['driving.can_drive_4x4'], 'invalid_choice')
  assert.equal(run((v) => { v.driving = { has_license: true, license_class: 'B', years_driving: 4, can_drive_4x4: true } }).ok, true)
})

test('text cap: 2000 code points accepted, 2001 rejected, emoji counts as one', () => {
  assert.equal(MAX_TEXT, 2000)
  const emoji = '😀'
  assert.equal(emoji.length, 2)
  assert.equal(run((v) => { v.personal.address = emoji.repeat(2000) }).ok, true)
  assert.equal(run((v) => { v.personal.address = emoji.repeat(2001) }).errors['personal.address'], 'too_long')
  assert.equal(run((v) => { v.experience.main_directions = 'a'.repeat(2001) }).errors['experience.main_directions'], 'too_long')
  assert.equal(run((v) => { v.regions_other = 'a'.repeat(2001) }).errors.regions_other, 'too_long')
})

test('references: 5 ok, 6 is too_many', () => {
  const ref = { name: 'A', position: 'B', contact: 'C' }
  assert.equal(run((v) => { v.references = Array(5).fill(ref) }).ok, true)
  assert.equal(run((v) => { v.references = Array(6).fill(ref) }).errors.references, 'too_many')
})

test('files: cv is required', () => {
  const r = validateApplication(validValues(), [{ kind: 'photo', name: 'me.jpg', size: 10, type: 'image/jpeg' }], NOW)
  assert.equal(r.errors['files.cv'], 'required')
  assert.equal(validateApplication(validValues(), [], NOW).errors['files.cv'], 'required')
})

test('files: more than 8 total is file_count', () => {
  const f = (kind, name) => ({ kind, name, size: 10, type: 'application/pdf' })
  const nine = [
    f('cv', 'a.pdf'), f('photo', 'b.pdf'), f('id_card', 'c.pdf'), f('driver_license', 'd.pdf'),
    f('first_aid', 'e.pdf'), f('guide_certificate', 'f.pdf'), f('guide_certificate', 'g.pdf'),
    f('guide_certificate', 'h.pdf'), f('guide_certificate', 'i.pdf'),
  ]
  assert.equal(validateApplication(validValues(), nine, NOW).errors.files, 'file_count')
})

test('files: two id_card is duplicate_kind, three certificates are fine, four are not', () => {
  const f = (kind) => ({ kind, name: 'x.pdf', size: 10, type: 'application/pdf' })
  assert.equal(
    validateApplication(validValues(), [f('cv'), f('id_card'), f('id_card')], NOW).errors['files.id_card'],
    'duplicate_kind',
  )
  assert.equal(
    validateApplication(validValues(), [f('cv'), f('guide_certificate'), f('guide_certificate'), f('guide_certificate')], NOW).ok,
    true,
  )
  assert.equal(
    validateApplication(validValues(), [f('cv'), ...Array(4).fill(f('guide_certificate'))], NOW).errors['files.guide_certificate'],
    'duplicate_kind',
  )
})

test('files: .exe is file_type, 0 bytes and 11 MB are file_size, 10 MB is fine', () => {
  const cv = (over) => [{ kind: 'cv', name: 'cv.pdf', size: 100, type: 'application/pdf', ...over }]
  assert.equal(validateApplication(validValues(), cv({ name: 'cv.exe', type: 'application/x-msdownload' }), NOW).errors['files.cv'], 'file_type')
  assert.equal(validateApplication(validValues(), cv({ name: 'cv' }), NOW).errors['files.cv'], 'file_type')
  assert.equal(validateApplication(validValues(), cv({ name: 'cv.pdf.exe' }), NOW).errors['files.cv'], 'file_type')
  assert.equal(validateApplication(validValues(), cv({ name: '.pdf' }), NOW).errors['files.cv'], 'file_type')
  assert.equal(validateApplication(validValues(), cv({ name: 'CV.PDF' }), NOW).ok, true)
  // declared MIME is ignored (browsers report odd types; the server sniffs bytes)
  assert.equal(validateApplication(validValues(), cv({ name: 'cv.jpg', type: 'image/pjpeg' }), NOW).ok, true)
  assert.equal(validateApplication(validValues(), cv({ type: '' }), NOW).ok, true)
  assert.equal(validateApplication(validValues(), cv({ size: NaN }), NOW).errors['files.cv'], 'file_size')
  assert.equal(validateApplication(validValues(), cv({ size: Infinity }), NOW).errors['files.cv'], 'file_size')
  assert.equal(validateApplication(validValues(), cv({ size: 0 }), NOW).errors['files.cv'], 'file_size')
  assert.equal(validateApplication(validValues(), cv({ size: 11 * 1024 * 1024 }), NOW).errors['files.cv'], 'file_size')
  assert.equal(validateApplication(validValues(), cv({ size: MAX_FILE_BYTES }), NOW).ok, true)
  assert.equal(validateApplication(validValues(), cv({ name: 'CV.JPG', type: 'image/jpeg' }), NOW).ok, true)
})

test('unknown file kind is invalid_choice on files.kind', () => {
  const r = validateApplication(validValues(), [...validFiles(), { kind: 'selfie', name: 'a.jpg', size: 5, type: 'image/jpeg' }], NOW)
  assert.equal(r.errors['files.kind'], 'invalid_choice')
})

test('driving.has_license is required until answered', () => {
  for (const bad of [undefined, null, 'yes', 1]) {
    const r = run((v) => { v.driving = { has_license: bad } })
    assert.equal(r.errors['driving.has_license'], 'required', String(bad))
  }
  assert.equal(run((v) => { delete v.driving }).errors['driving.has_license'], 'required')
  assert.equal('driving.has_license' in run((v) => { v.driving = { has_license: true } }).errors, false)
  assert.equal('driving.has_license' in run((v) => { v.driving = { has_license: false } }).errors, false)
})

test('birth date accepts only strict ISO YYYY-MM-DD', () => {
  for (const bad of ['1', '12/05/2000', '2000-5-1', '2000-02-31', '2000-13-01', '1995-05-20T00:00:00Z', '19950520']) {
    assert.equal(run((v) => { v.personal.birth_date = bad }).errors['personal.birth_date'], 'invalid_choice', bad)
  }
  assert.equal(run((v) => { v.personal.birth_date = '2000-02-29' }).ok, true)
})

test('now defaults to the current time and an invalid Date throws', () => {
  assert.equal(validateApplication(validValues(), validFiles()).ok, true)
  assert.throws(() => validateApplication(validValues(), validFiles(), new Date('nope')), TypeError)
  assert.throws(() => validateApplication(validValues(), validFiles(), '2026-10-06'), TypeError)
})

test('missing input and null array entries never throw', () => {
  const r = validateApplication(undefined, undefined, NOW)
  assert.equal(r.ok, false)
  assert.equal(validateApplication(null, null, NOW).ok, false)
  const v = validValues()
  v.languages.push(null)
  v.regions.push(null)
  v.references.push(null)
  v.experience.tour_types.push(null)
  v.availability.months.push(null)
  const res = validateApplication(v, [null, ...validFiles()], NOW)
  assert.equal(res.ok, false)
})

test('normalizeServerField maps backend names onto form keys', () => {
  const table = [
    ['full_name', 'personal.full_name'], ['nickname', 'personal.nickname'], ['phone', 'personal.phone'],
    ['email', 'personal.email'], ['birth_date', 'personal.birth_date'], ['gender', 'personal.gender'],
    ['address', 'personal.address'],
    ['emergency_contact', 'personal.emergency_contact'],
    ['emergency_contact.name', 'personal.emergency_contact.name'],
    ['emergency_contact.phone', 'personal.emergency_contact.phone'],
    ['consent_at', 'consent'],
    ['languages.mn', 'languages'], ['languages.en', 'languages'],
    ['driving', 'driving.has_license'],
    ['regions_other', 'regions_other'], ['regions', 'regions'], ['files', 'files'],
    ['files.cv', 'files.cv'], ['files.guide_certificate', 'files.guide_certificate'],
    ['references', 'references'], ['references.name', 'references.name'],
    ['availability.months', 'availability.months'], ['experience.years', 'experience.years'],
    ['driving.license_class', 'driving.license_class'],
    ['languages.other_name', 'languages.other_name'],
    ['personal.email', 'personal.email'], ['personal.emergency_contact.name', 'personal.emergency_contact.name'],
    ['locale', 'locale'], ['something_unknown', 'something_unknown'],
  ]
  for (const [input, want] of table) assert.equal(normalizeServerField(input), want, input)
})

test('normalizeServerField tolerates hostile input', () => {
  for (const bad of [undefined, null, 42, {}, [], true, Symbol('x')]) {
    assert.equal(normalizeServerField(bad), '')
  }
  assert.doesNotThrow(() => normalizeServerField('__proto__'))
  assert.doesNotThrow(() => normalizeServerField('a'.repeat(100000)))
  assert.equal(normalizeServerField(''), '')
})

test('exported constants match the backend lists exactly', () => {
  assert.equal(MAX_FILE_BYTES, 10 * 1024 * 1024)
  assert.equal(MAX_FILES, 8)
  assert.deepEqual([...ALLOWED_FILE_EXTENSIONS], ['jpg', 'jpeg', 'png', 'pdf'])
  assert.deepEqual([...FILE_KINDS], ['photo', 'id_card', 'driver_license', 'guide_certificate', 'cv', 'first_aid'])
  assert.deepEqual([...REGIONS], ['gobi', 'central', 'khuvsgul', 'western', 'eastern', 'ulaanbaatar_terelj', 'other'])
  assert.deepEqual([...TOUR_TYPES], [
    'private', 'group', 'vip', 'adventure_4x4', 'cultural',
    'hiking_trekking', 'festival', 'business_corporate',
  ])
  assert.deepEqual([...TRIP_LENGTHS], ['d1_3', 'd4_7', 'd8_14', 'd15_plus'])
  assert.deepEqual([...LANGUAGE_CODES], ['mn', 'en', 'ko', 'zh', 'ja', 'ru', 'fr', 'es', 'other'])
  assert.deepEqual([...LANGUAGE_LEVELS_MN], ['native', 'good', 'intermediate'])
  assert.deepEqual([...LANGUAGE_LEVELS_OTHER], ['native', 'fluent', 'intermediate', 'basic'])
})

test('numeric fields are capped to 0..1000 and NaN is rejected', () => {
  const run = (v) => validateApplication(v, [], NOW).errors
  assert.equal(run({ experience: { years: 1001 } })['experience.years'], 'invalid_choice')
  assert.equal(run({ experience: { years: NaN } })['experience.years'], 'invalid_choice')
  assert.equal(run({ experience: { years: 1000 } })['experience.years'], undefined)
  assert.equal(run({ experience: { largest_group: 5000 } })['experience.largest_group'], 'invalid_choice')
  assert.equal(run({ driving: { has_license: true, years_driving: 2000 } })['driving.years_driving'], 'invalid_choice')
})
