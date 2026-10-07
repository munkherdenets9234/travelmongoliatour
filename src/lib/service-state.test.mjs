import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { classifyStatusFailure, failureInputFromError } from './service-state.mjs'

test('503 TENANT FEATURE_UNAVAILABLE is unavailable', () => {
  assert.equal(classifyStatusFailure({ status: 503, domain: 'TENANT', code: 'FEATURE_UNAVAILABLE' }), 'unavailable')
})
test('503 with another domain is active', () => {
  assert.equal(classifyStatusFailure({ status: 503, domain: 'BOOKING', code: 'FEATURE_UNAVAILABLE' }), 'active')
})
test('503 TENANT with another code is active', () => {
  assert.equal(classifyStatusFailure({ status: 503, domain: 'TENANT', code: 'OTHER' }), 'active')
})
for (const status of [502, 503, 504]) {
  test(`${status} with no code and no domain is unavailable`, () => {
    assert.equal(classifyStatusFailure({ status }), 'unavailable')
  })
}
test('502 with a code is active', () => {
  assert.equal(classifyStatusFailure({ status: 502, code: 'X' }), 'active')
})
test('500 with no code is active', () => {
  assert.equal(classifyStatusFailure({ status: 500 }), 'active')
})
test('404 is active', () => {
  assert.equal(classifyStatusFailure({ status: 404 }), 'active')
})
test('401 and 403 are active', () => {
  assert.equal(classifyStatusFailure({ status: 401 }), 'active')
  assert.equal(classifyStatusFailure({ status: 403 }), 'active')
})
test('networkError is unavailable', () => {
  assert.equal(classifyStatusFailure({ networkError: true }), 'unavailable')
})
test('timedOut is unavailable', () => {
  assert.equal(classifyStatusFailure({ timedOut: true }), 'unavailable')
})
test('status 0 (dev-mode connect failure) is unavailable', () => {
  assert.equal(classifyStatusFailure({ status: 0 }), 'unavailable')
})
test('no arguments / empty object is active', () => {
  assert.equal(classifyStatusFailure(), 'active')
  assert.equal(classifyStatusFailure({}), 'active')
})

test('failureInputFromError reads status, code and domain from an ApiError-like object', () => {
  const err = Object.assign(new Error('x'), { status: 503, code: 'FEATURE_UNAVAILABLE', domain: 'TENANT' })
  assert.deepEqual(failureInputFromError(err), { status: 503, code: 'FEATURE_UNAVAILABLE', domain: 'TENANT' })
})
test('failureInputFromError drops non-string code and domain', () => {
  const err = { status: 502, code: 5, domain: null }
  assert.deepEqual(failureInputFromError(err), { status: 502, code: undefined, domain: undefined })
})
test('failureInputFromError maps TypeError to networkError', () => {
  assert.deepEqual(failureInputFromError(new TypeError('fetch failed')), { networkError: true })
})
test('failureInputFromError maps AbortError and TimeoutError to timedOut', () => {
  assert.deepEqual(failureInputFromError(Object.assign(new Error('a'), { name: 'AbortError' })), { timedOut: true })
  assert.deepEqual(failureInputFromError(Object.assign(new Error('t'), { name: 'TimeoutError' })), { timedOut: true })
})
test('failureInputFromError maps a plain Error, null and strings to {}', () => {
  assert.deepEqual(failureInputFromError(new Error('TENANT_API_KEY missing')), {})
  assert.deepEqual(failureInputFromError(null), {})
  assert.deepEqual(failureInputFromError(undefined), {})
  assert.deepEqual(failureInputFromError('boom'), {})
})
test('failureInputFromError + classifier: plain Error is active, dev status 0 and TypeError unavailable', () => {
  assert.equal(classifyStatusFailure(failureInputFromError(new Error('missing key'))), 'active')
  assert.equal(classifyStatusFailure(failureInputFromError({ status: 0 })), 'unavailable')
  assert.equal(classifyStatusFailure(failureInputFromError(new TypeError('x'))), 'unavailable')
})

for (const locale of ['en', 'mn', 'ko']) {
  test(`${locale}.json has non-empty serviceUnavailable strings`, () => {
    const json = JSON.parse(readFileSync(new URL(`../locales/${locale}.json`, import.meta.url), 'utf8'))
    for (const key of ['title', 'body', 'retry', 'formMessage']) {
      assert.equal(typeof json.serviceUnavailable?.[key], 'string', key)
      assert.ok(json.serviceUnavailable[key].trim().length > 0, key)
    }
  })
}
