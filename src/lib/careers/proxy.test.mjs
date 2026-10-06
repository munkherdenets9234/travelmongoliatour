import test from 'node:test'
import assert from 'node:assert/strict'
import { checkBodySize, fieldFromMessage, buildForwardForm } from './proxy.mjs'

const MAX = 1000

test('checkBodySize accepts up to the limit and rejects the rest', () => {
  assert.equal(checkBodySize(MAX, MAX), true)
  assert.equal(checkBodySize(0, MAX), true)
  assert.equal(checkBodySize(MAX + 1, MAX), false)
  assert.equal(checkBodySize('999', MAX), true)
})

test('checkBodySize rejects missing, NaN, negative and non-numeric lengths', () => {
  assert.equal(checkBodySize(null, MAX), false)
  assert.equal(checkBodySize(undefined, MAX), false)
  assert.equal(checkBodySize(NaN, MAX), false)
  assert.equal(checkBodySize(-1, MAX), false)
  assert.equal(checkBodySize('abc', MAX), false)
  assert.equal(checkBodySize('', MAX), false)
  assert.equal(checkBodySize(Infinity, MAX), false)
})

test('fieldFromMessage returns the field path before the first colon', () => {
  assert.equal(fieldFromMessage('personal.email: invalid'), 'personal.email')
  assert.equal(fieldFromMessage('files.cv: required'), 'files.cv')
  assert.equal(fieldFromMessage('name: too long: really'), 'name')
})

test('fieldFromMessage rejects hostile or malformed input', () => {
  for (const m of ['<b>x</b>: bad', 'has space: x', 'Upper.case: x', 'a'.repeat(200) + ': x', '', ': x', 'no colon here', '1abc: x', 'a'.repeat(62) + ': x', null, undefined, 42]) {
    assert.equal(fieldFromMessage(m), undefined, String(m))
  }
})

const file = (name, content = 'x') => new File([content], name, { type: 'application/pdf' })

test('buildForwardForm copies data, honeypot and valid files only', () => {
  const fd = new FormData()
  fd.append('data', '{"a":1}')
  fd.append('website', '   ')
  fd.append('file_photo', file('p.png'))
  fd.append('file_guide_certificate_2', file('c.pdf'))
  const r = buildForwardForm(fd)
  assert.equal(r.ok, true)
  assert.equal(r.form.get('data'), '{"a":1}')
  assert.equal(r.form.get('website'), '   ')
  assert.equal(r.form.get('file_photo').name, 'p.png')
  assert.equal(r.form.get('file_guide_certificate_2').name, 'c.pdf')
  assert.equal([...r.form.keys()].length, 4)
})

test('buildForwardForm rejects unknown fields and bad names', () => {
  for (const name of ['extra', 'file_other', 'file_guide_certificate_0', 'file_guide_certificate_4', 'file_', 'File_photo']) {
    const fd = new FormData()
    fd.append('data', '{}')
    fd.append(name, file('a.pdf'))
    assert.equal(buildForwardForm(fd).ok, false, name)
  }
  const fd = new FormData()
  fd.append('data', '{}')
  fd.append('role', 'admin')
  assert.equal(buildForwardForm(fd).ok, false)
})

test('buildForwardForm drops empty file parts', () => {
  const fd = new FormData()
  fd.append('data', '{}')
  fd.append('file_photo', new File([], 'p.png'))
  fd.append('file_cv', new File(['x'], ''))
  const r = buildForwardForm(fd)
  assert.equal(r.ok, true)
  assert.deepEqual([...r.form.keys()], ['data'])
})

test('buildForwardForm rejects missing/duplicate/oversize/non-string data', () => {
  assert.equal(buildForwardForm(new FormData()).ok, false)
  const dup = new FormData()
  dup.append('data', '{}'); dup.append('data', '{}')
  assert.equal(buildForwardForm(dup).ok, false)
  const big = new FormData()
  big.append('data', 'x'.repeat(256 * 1024 + 1))
  assert.equal(buildForwardForm(big).ok, false)
  const asFile = new FormData()
  asFile.append('data', file('d.json'))
  assert.equal(buildForwardForm(asFile).ok, false)
  const ok = new FormData()
  ok.append('data', 'x'.repeat(256 * 1024))
  assert.equal(buildForwardForm(ok).ok, true)
})

test('buildForwardForm rejects a text value for a file field and a file for website', () => {
  const a = new FormData()
  a.append('data', '{}'); a.append('file_photo', 'text')
  assert.equal(buildForwardForm(a).ok, false)
  const b = new FormData()
  b.append('data', '{}'); b.append('website', file('w.txt'))
  assert.equal(buildForwardForm(b).ok, false)
})

test('buildForwardForm rejects more than 8 files and duplicate file names', () => {
  const fd = new FormData()
  fd.append('data', '{}')
  for (const k of ['photo', 'id_card', 'driver_license', 'guide_certificate', 'cv', 'first_aid', 'guide_certificate_1', 'guide_certificate_2', 'guide_certificate_3']) {
    fd.append(`file_${k}`, file('a.pdf'))
  }
  assert.equal(buildForwardForm(fd).ok, false)
  const dup = new FormData()
  dup.append('data', '{}')
  dup.append('file_cv', file('a.pdf')); dup.append('file_cv', file('b.pdf'))
  assert.equal(buildForwardForm(dup).ok, false)
})
