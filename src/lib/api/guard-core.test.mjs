import test from 'node:test'
import assert from 'node:assert/strict'
import {
  cleanString, cleanEmail, cleanPhone, cleanChoice, cleanInt, cleanDate,
  isHoneypotTripped, createRateLimiter, visitorIp, redactForLog,
} from './guard-core.mjs'

test('cleanString trims, bounds length, rejects non-strings and control chars', () => {
  assert.deepEqual(cleanString('  Ann  ', { min: 1, max: 5 }), { ok: true, value: 'Ann' })
  assert.equal(cleanString('abcdef', { max: 5 }).ok, false)
  assert.equal(cleanString('abcde', { max: 5 }).ok, true)
  assert.equal(cleanString('', { min: 1 }).ok, false)
  assert.equal(cleanString('   ', { min: 1 }).ok, false)
  assert.equal(cleanString(undefined, { min: 0 }).ok, true)
  assert.equal(cleanString(null, { min: 1 }).ok, false)
  assert.equal(cleanString(42).ok, false)
  assert.equal(cleanString({ a: 1 }).ok, false)
  assert.equal(cleanString('a\u0000b').ok, false)
})

test('cleanString only allows newlines when multiline', () => {
  assert.equal(cleanString('a\nb').ok, false)
  assert.equal(cleanString('a\nb', { multiline: true }).ok, true)
})

test('cleanEmail accepts normal addresses and rejects malformed ones', () => {
  assert.equal(cleanEmail('a.b+c@example.com').ok, true)
  for (const bad of ['', 'a', 'a@b', 'a@b.c', '@x.com', 'a@@x.com', 'a b@x.com', 'a@x.com,b@y.com', 'a@x.com\nBcc: z@y.com', 5, null, 'x'.repeat(250) + '@x.com']) {
    assert.equal(cleanEmail(bad).ok, false, String(bad))
  }
})

test('cleanPhone is optional but strict when present', () => {
  assert.equal(cleanPhone('').ok, true)
  assert.equal(cleanPhone(null).ok, true)
  assert.equal(cleanPhone('+976 9911-2233').ok, true)
  assert.equal(cleanPhone('abc12345').ok, false)
  assert.equal(cleanPhone('1234').ok, false)
  assert.equal(cleanPhone('1'.repeat(31)).ok, false)
})

test('cleanChoice only allows listed strings', () => {
  assert.equal(cleanChoice('vip', ['standard', 'vip']).ok, true)
  assert.equal(cleanChoice('gold', ['standard', 'vip']).ok, false)
  assert.equal(cleanChoice(['vip'], ['standard', 'vip']).ok, false)
  assert.equal(cleanChoice(undefined, ['standard']).ok, false)
})

test('cleanInt enforces integer range and accepts numeric strings', () => {
  assert.deepEqual(cleanInt(3, { min: 1, max: 5 }), { ok: true, value: 3 })
  assert.equal(cleanInt('4', { min: 1, max: 5 }).value, 4)
  assert.equal(cleanInt(1, { min: 1, max: 5 }).ok, true)
  assert.equal(cleanInt(5, { min: 1, max: 5 }).ok, true)
  for (const bad of [0, 6, 2.5, NaN, '', 'x', null, undefined, [], true]) {
    assert.equal(cleanInt(bad, { min: 1, max: 5 }).ok, false, String(bad))
  }
})

test('cleanDate rejects junk, the past and the far future; normalises to ISO', () => {
  const now = Date.parse('2026-10-05T15:00:00Z')
  assert.equal(cleanDate('2026-10-05', { now }).ok, true) // today is allowed
  assert.equal(cleanDate('2026-10-04', { now }).ok, false)
  assert.equal(cleanDate('2026-10-04', { now, allowPast: true }).ok, true)
  assert.equal(cleanDate('2027-01-15', { now }).value, '2027-01-15T00:00:00.000Z')
  assert.equal(cleanDate('2026-10-05T10:30', { now }).ok, true)
  assert.equal(cleanDate('2040-01-01', { now }).ok, false)
  for (const bad of ['', 'not a date', '2026-13-45', 20261010, null, undefined, 'x'.repeat(50)]) {
    assert.equal(cleanDate(bad, { now }).ok, false, String(bad))
  }
})

test('honeypot trips only on a non-empty value', () => {
  assert.equal(isHoneypotTripped({ website: 'http://spam' }), true)
  assert.equal(isHoneypotTripped({ website: 0 }), true)
  assert.equal(isHoneypotTripped({ website: '' }), false)
  assert.equal(isHoneypotTripped({ website: null }), false)
  assert.equal(isHoneypotTripped({}), false)
  assert.equal(isHoneypotTripped(null), false)
  assert.equal(isHoneypotTripped({ hp: 'x' }, 'hp'), true)
})

test('rate limiter allows a burst then blocks, per key', () => {
  let t = 0
  const rl = createRateLimiter({ capacity: 3, refillPerSec: 1, now: () => t })
  assert.equal(rl.take('a').allowed, true)
  assert.equal(rl.take('a').allowed, true)
  assert.equal(rl.take('a').allowed, true)
  const blocked = rl.take('a')
  assert.equal(blocked.allowed, false)
  assert.equal(blocked.retryAfterSec, 1)
  assert.equal(rl.take('b').allowed, true) // other visitors unaffected
})

test('rate limiter refills over time but never above capacity', () => {
  let t = 0
  const rl = createRateLimiter({ capacity: 2, refillPerSec: 1, now: () => t })
  rl.take('a')
  rl.take('a')
  assert.equal(rl.take('a').allowed, false)
  t = 1000
  assert.equal(rl.take('a').allowed, true)
  assert.equal(rl.take('a').allowed, false)
  t = 1_000_000
  assert.equal(rl.take('a').allowed, true)
  assert.equal(rl.take('a').allowed, true)
  assert.equal(rl.take('a').allowed, false) // capped at 2, not 1000
})

test('rate limiter stays bounded and evicts the least recently used key', () => {
  const rl = createRateLimiter({ capacity: 1, refillPerSec: 0.001, maxKeys: 3, now: () => 0 })
  for (const k of ['a', 'b', 'c']) rl.take(k)
  assert.equal(rl.size(), 3)
  rl.take('a') // blocked but refreshes recency
  rl.take('d') // evicts b
  assert.equal(rl.size(), 3)
  assert.equal(rl.take('a').allowed, false) // a kept its state
  assert.equal(rl.take('b').allowed, true) // b was evicted, fresh bucket
})

test('visitorIp takes the first forwarded hop, falls back, and rejects junk', () => {
  const h = (map) => (n) => map[n]
  assert.equal(visitorIp(h({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' })), '203.0.113.7')
  assert.equal(visitorIp(h({ 'x-forwarded-for': '2001:db8::1' })), '2001:db8::1')
  assert.equal(visitorIp(h({ 'x-real-ip': '198.51.100.2' })), '198.51.100.2')
  assert.equal(visitorIp(h({ 'x-forwarded-for': '<script>', 'x-real-ip': '198.51.100.2' })), '198.51.100.2')
  assert.equal(visitorIp(h({ 'x-forwarded-for': 'evil\r\nX-Foo: 1' })), 'unknown')
  assert.equal(visitorIp(h({})), 'unknown')
})

test('redactForLog hides emails, tokens and long numbers and truncates', () => {
  const token = ['abcdef', '0123456789', 'ABCDEFGH', 'xyz_-'].join('')
  const out = redactForLog(`failed for a@b.com key ${token} id 12345678`)
  assert.ok(!out.includes('a@b.com') && !out.includes(token) && !out.includes('12345678'))
  assert.equal(redactForLog('x '.repeat(500)).length, 200)
  assert.equal(redactForLog(undefined), '')
})
