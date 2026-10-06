import test from 'node:test'
import assert from 'node:assert/strict'
import { modesOf, supportsMode, pickMode, dateBounds, withinBounds } from './availability.mjs'

const BOTH = ['with-driver', 'self-drive']

test('modesOf returns both modes when absent or empty', () => {
  assert.deepEqual(modesOf({}), BOTH)
  assert.deepEqual(modesOf({ rentalModes: [] }), BOTH)
  assert.deepEqual(modesOf({ rentalModes: ['self-drive'] }), ['self-drive'])
})

test('supportsMode', () => {
  assert.equal(supportsMode({ rentalModes: ['self-drive'] }, 'with-driver'), false)
  assert.equal(supportsMode({ rentalModes: ['self-drive'] }, 'self-drive'), true)
  assert.equal(supportsMode({}, 'with-driver'), true)
})

test('pickMode keeps a supported request, else falls back', () => {
  assert.equal(pickMode('self-drive', [{ rentalModes: ['with-driver'] }]), 'with-driver')
  assert.equal(pickMode('self-drive', [{ rentalModes: ['with-driver'] }, { rentalModes: ['self-drive'] }]), 'self-drive')
  assert.equal(pickMode(undefined, [{ rentalModes: ['self-drive'] }]), 'self-drive')
  assert.equal(pickMode(undefined, []), 'with-driver')
  assert.equal(pickMode('bogus', []), 'with-driver')
})

test('dateBounds applies to self-drive with both dates only', () => {
  const car = { selfDriveFrom: '2026-07-01', selfDriveTo: '2026-08-31' }
  assert.deepEqual(dateBounds(car, 'self-drive'), { min: '2026-07-01', max: '2026-08-31' })
  assert.deepEqual(dateBounds(car, 'with-driver'), {})
  assert.deepEqual(dateBounds({ selfDriveFrom: '2026-07-01' }, 'self-drive'), {})
  assert.deepEqual(dateBounds({}, 'self-drive'), {})
})

test('withinBounds is inclusive and empty bounds accept all', () => {
  const b = { min: '2026-07-01', max: '2026-08-31' }
  assert.equal(withinBounds(b, '2026-07-01', '2026-08-31'), true)
  assert.equal(withinBounds(b, '2026-06-30', '2026-07-05'), false)
  assert.equal(withinBounds(b, '2026-08-25', '2026-09-01'), false)
  assert.equal(withinBounds({}, '2020-01-01', '2030-01-01'), true)
})
