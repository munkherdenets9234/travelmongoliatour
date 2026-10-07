import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseSubscriptionState } from './subscription-state.mjs'

test('expired object returns expired', () => {
  assert.equal(parseSubscriptionState({ state: 'expired' }), 'expired')
})

test('active object returns active', () => {
  assert.equal(parseSubscriptionState({ state: 'active' }), 'active')
})

for (const [name, value] of [
  ['null', null],
  ['undefined', undefined],
  ['bare string expired', 'expired'],
  ['array', []],
  ['array holding an expired object', [{ state: 'expired' }]],
  ['upper-case EXPIRED', { state: 'EXPIRED' }],
  ['unknown state', { state: 'weird' }],
  ['empty object', {}],
  ['number', 1],
  ['envelope not unwrapped', { success: true, data: { state: 'expired' } }],
]) {
  test(`${name} returns active`, () => {
    assert.equal(parseSubscriptionState(value), 'active')
  })
}

for (const locale of ['en', 'mn', 'ko']) {
  test(`${locale}.json has a non-empty subscription.expiredNotice`, () => {
    const json = JSON.parse(readFileSync(new URL(`../locales/${locale}.json`, import.meta.url), 'utf8'))
    assert.equal(typeof json.subscription?.expiredNotice, 'string')
    assert.ok(json.subscription.expiredNotice.trim().length > 0)
  })
}
