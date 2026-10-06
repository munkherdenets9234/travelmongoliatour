import test from 'node:test'
import assert from 'node:assert/strict'
import { checkBodySize, clientIp, createRateLimiter, buildForwardForm } from './proxy.mjs'

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

const h = (obj) => new Headers(obj)

test('clientIp takes the first plausible x-forwarded-for entry', () => {
  assert.equal(clientIp(h({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' })), '203.0.113.7')
  assert.equal(clientIp(h({ 'x-forwarded-for': '2001:db8::1' })), '2001:db8::1')
  assert.equal(clientIp(h({ 'x-forwarded-for': '  198.51.100.4  ' })), '198.51.100.4')
})

test('clientIp falls back to x-real-ip then null', () => {
  assert.equal(clientIp(h({ 'x-real-ip': '192.0.2.9' })), '192.0.2.9')
  assert.equal(clientIp(h({})), null)
  assert.equal(clientIp(h({ 'x-forwarded-for': '' })), null)
})

test('clientIp never trusts garbage', () => {
  assert.equal(clientIp(h({ 'x-forwarded-for': '<script>alert(1)</script>' })), null)
  assert.equal(clientIp(h({ 'x-forwarded-for': 'a'.repeat(60) })), null)
  assert.equal(clientIp(h({ 'x-forwarded-for': 'not an ip', 'x-real-ip': '192.0.2.9' })), '192.0.2.9')
  assert.equal(clientIp(h({ 'x-forwarded-for': 'bad', 'x-real-ip': 'also bad!' })), null)
  const raw = { get: (n) => (n === 'x-forwarded-for' ? '1.2.3.4\r\nX-Evil: 1' : null) }
  assert.equal(clientIp(raw), null)
})

test('rate limiter allows max per window then blocks, per key', () => {
  let t = 0
  const rl = createRateLimiter({ max: 2, windowMs: 1000, now: () => t })
  assert.equal(rl.allow('a'), true)
  assert.equal(rl.allow('a'), true)
  assert.equal(rl.allow('a'), false)
  assert.equal(rl.allow('b'), true)
})

test('rate limiter window rolls over', () => {
  let t = 0
  const rl = createRateLimiter({ max: 1, windowMs: 1000, now: () => t })
  assert.equal(rl.allow('a'), true)
  assert.equal(rl.allow('a'), false)
  t = 999
  assert.equal(rl.allow('a'), false)
  t = 1000
  assert.equal(rl.allow('a'), true)
})

test('rate limiter caps tracked keys, evicting the oldest', () => {
  let t = 0
  const rl = createRateLimiter({ max: 1, windowMs: 1_000_000, now: () => t, maxKeys: 3 })
  for (const k of ['a', 'b', 'c', 'd']) rl.allow(k)
  assert.equal(rl.size(), 3)
  // 'a' was evicted, so it starts a fresh window; 'd' is still tracked and blocked.
  assert.equal(rl.allow('d'), false)
  assert.equal(rl.allow('a'), true)
})

test('rate limiter drops expired keys on sweep', () => {
  let t = 0
  const rl = createRateLimiter({ max: 1, windowMs: 100, now: () => t, maxKeys: 100 })
  rl.allow('a'); rl.allow('b')
  t = 500
  rl.allow('c')
  assert.equal(rl.size(), 1)
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
