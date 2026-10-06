import test from 'node:test'
import assert from 'node:assert/strict'
import { emptyState, buildPayload, buildSubmitForm, mapSubmitFailure } from './payload.mjs'
import { validateApplication } from './validate.mjs'

const NOW = new Date('2026-10-06T12:00:00Z')

function filledState() {
  const s = emptyState()
  s.personal = {
    ...s.personal, full_name: ' Bat Dorj ', phone: '+976 9911 2233', email: 'a@b.mn', birth_date: '1990-05-01',
    gender: 'male', emergency_name: 'Mom', emergency_phone: '99112244',
  }
  s.languages.mn.level = 'native'
  s.languages.en.level = 'fluent'
  s.languages.other = { level: 'basic', other_name: ' German ' }
  s.experience.years = '3'
  s.experience.largest_group = ''
  s.experience.tour_types = ['private']
  s.regions = ['gobi']
  s.driving.has_license = true
  s.driving.years_driving = '5.7'
  s.driving.can_drive_4x4 = true
  s.availability.months = [7, 6]
  s.references = [{ name: '', position: '', contact: '' }, { name: 'X', position: '', contact: '' }]
  s.consent = true
  return s
}

const file = (name, size = 10) => new File([new Uint8Array(size)], name, { type: 'application/pdf' })

test('buildPayload produces a validator-clean payload', () => {
  const p = buildPayload(filledState(), 'mn')
  assert.equal(p.locale, 'mn')
  assert.equal(p.consent, true)
  assert.equal(p.personal.full_name, 'Bat Dorj')
  assert.deepEqual(p.personal.emergency_contact, { name: 'Mom', phone: '99112244' })
  assert.deepEqual(p.languages.map((l) => l.language), ['mn', 'en', 'other'])
  assert.equal(p.languages[2].other_name, 'German')
  assert.equal('other_name' in p.languages[0], false)
  assert.equal(p.experience.years, 3)
  assert.equal(p.experience.largest_group, undefined)
  assert.equal(p.driving.years_driving, 5)
  assert.deepEqual(p.availability.months, [6, 7])
  assert.equal(p.references.length, 1)
  const files = [{ kind: 'cv', name: 'cv.pdf', size: 10, type: 'application/pdf' }]
  assert.deepEqual(validateApplication(p, files, NOW), { ok: true, errors: {} })
})

test('locale is mn only for mn, otherwise en', () => {
  assert.equal(buildPayload(emptyState(), 'ko').locale, 'en')
  assert.equal(buildPayload(emptyState(), 'en').locale, 'en')
})

test('unanswered license is omitted so validation flags it; no license sends only has_license', () => {
  const s = emptyState()
  assert.deepEqual(buildPayload(s, 'en').driving, {})
  assert.equal(validateApplication(buildPayload(s, 'en'), [], NOW).errors['driving.has_license'], 'required')
  s.driving.has_license = false
  s.driving.vehicles = 'leftover'
  assert.deepEqual(buildPayload(s, 'en').driving, { has_license: false })
})

test('inactive other-language row (no level) is dropped with its stale name', () => {
  const s = emptyState()
  s.languages.other.other_name = 'German'
  const p = buildPayload(s, 'en')
  assert.equal(p.languages.some((l) => l.language === 'other'), false)
})

test('regions_other is sent only when other is ticked', () => {
  const s = emptyState()
  s.regions = ['gobi']
  s.regions_other = 'stale'
  assert.equal('regions_other' in buildPayload(s, 'en'), false)
  s.regions = ['gobi', 'other']
  assert.equal(buildPayload(s, 'en').regions_other, 'stale')
})

test('non-numeric or oversized numbers are rejected by the validator', () => {
  const s = emptyState()
  s.experience.years = '5000'
  assert.equal(validateApplication(buildPayload(s, 'en'), [], NOW).errors['experience.years'], 'invalid_choice')
  s.experience.years = 'abc'
  assert.equal(validateApplication(buildPayload(s, 'en'), [], NOW).errors['experience.years'], 'invalid_choice')
})

test('buildSubmitForm: data, consent_at, honeypot always present; no consent field', () => {
  const p = buildPayload(filledState(), 'en')
  const form = buildSubmitForm(p, {}, '', NOW)
  assert.deepEqual([...form.keys()], ['data', 'website'])
  assert.equal(form.get('website'), '')
  const data = JSON.parse(form.get('data'))
  assert.equal(data.consent_at, '2026-10-06T12:00:00.000Z')
  assert.equal('consent' in data, false)
  assert.equal(data.personal.birth_date, '1990-05-01T00:00:00Z')
  assert.equal(data.locale, 'en')
})

test('buildSubmitForm: no consent_at without consent; honeypot value is passed through', () => {
  const s = filledState()
  s.consent = false
  const form = buildSubmitForm(buildPayload(s, 'en'), {}, 'bot', NOW)
  assert.equal('consent_at' in JSON.parse(form.get('data')), false)
  assert.equal(form.get('website'), 'bot')
})

test('buildSubmitForm: file parts only for chosen files, named by kind', () => {
  const p = buildPayload(filledState(), 'en')
  const form = buildSubmitForm(
    p,
    {
      cv: [file('cv.pdf')],
      photo: [],
      id_card: [file('empty.pdf', 0)],
      first_aid: [file('fa.png'), file('second.png')],
    },
    '',
    NOW,
  )
  assert.deepEqual([...form.keys()], ['data', 'website', 'file_cv', 'file_first_aid'])
  assert.equal(form.get('file_cv').name, 'cv.pdf')
  assert.equal(form.get('file_first_aid').name, 'fa.png')
})

test('buildSubmitForm: certificates are numbered 1..3 and capped', () => {
  const p = buildPayload(filledState(), 'en')
  const certs = [file('a.pdf'), file('b.pdf'), file('c.pdf'), file('d.pdf')]
  const form = buildSubmitForm(p, { guide_certificate: certs }, '', NOW)
  assert.deepEqual(
    [...form.keys()].filter((k) => k.startsWith('file_')),
    ['file_guide_certificate_1', 'file_guide_certificate_2', 'file_guide_certificate_3'],
  )
  assert.equal(form.get('file_guide_certificate_3').name, 'c.pdf')
})

test('buildSubmitForm: every part name is accepted by the proxy', async () => {
  const { buildForwardForm } = await import('./proxy.mjs')
  const p = buildPayload(filledState(), 'en')
  const all = Object.fromEntries(
    ['photo', 'id_card', 'driver_license', 'cv', 'first_aid'].map((k) => [k, [file(`${k}.pdf`)]]),
  )
  all.guide_certificate = [file('a.pdf'), file('b.pdf'), file('c.pdf')]
  const r = buildForwardForm(buildSubmitForm(p, all, '', NOW))
  assert.equal(r.ok, true)
})

test('mapSubmitFailure decides by status', () => {
  assert.deepEqual(mapSubmitFailure(409), { code: 'duplicate', field: 'personal.email' })
  assert.deepEqual(mapSubmitFailure(413), { code: 'too_large', field: '' })
  assert.deepEqual(mapSubmitFailure(429), { code: 'rate_limited', field: '' })
  assert.deepEqual(mapSubmitFailure(503), { code: 'unavailable', field: '' })
  assert.deepEqual(mapSubmitFailure(502), { code: 'generic', field: '' })
  assert.deepEqual(mapSubmitFailure(500, 'email'), { code: 'generic', field: '' })
})

test('mapSubmitFailure routes 400/422 hints', () => {
  assert.deepEqual(mapSubmitFailure(422, 'email'), { code: 'generic', field: 'personal.email' })
  assert.deepEqual(mapSubmitFailure(400, 'consent_at'), { code: 'generic', field: 'consent' })
  assert.deepEqual(mapSubmitFailure(422, 'files.cv'), { code: 'file_unreadable', field: 'files.cv' })
  assert.deepEqual(mapSubmitFailure(422), { code: 'generic', field: '' })
  assert.deepEqual(mapSubmitFailure(400, 42), { code: 'generic', field: '' })
})
