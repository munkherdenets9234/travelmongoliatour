// Pure helpers for car rental modes and the self-drive date range.
// Site mode names: 'with-driver' | 'self-drive'. Client-side convenience only;
// the backend enforces the same rules.

const ALL_MODES = ['with-driver', 'self-drive']

export function modesOf(car) {
  const list = car && Array.isArray(car.rentalModes) ? car.rentalModes : []
  return list.length > 0 ? list : [...ALL_MODES]
}

export function supportsMode(car, mode) {
  return modesOf(car).includes(mode)
}

export function pickMode(requested, cars) {
  const list = cars || []
  if (requested && list.some((c) => supportsMode(c, requested))) return requested
  for (const m of ALL_MODES) {
    if (list.some((c) => supportsMode(c, m))) return m
  }
  return 'with-driver'
}

export function dateBounds(car, mode) {
  if (mode !== 'self-drive' || !car || !car.selfDriveFrom || !car.selfDriveTo) return {}
  return { min: car.selfDriveFrom, max: car.selfDriveTo }
}

// Date-only (YYYY-MM-DD) strings compare correctly as text. Both ends inclusive.
export function withinBounds(bounds, pickup, ret) {
  const { min, max } = bounds || {}
  for (const d of [pickup, ret]) {
    if (min && d < min) return false
    if (max && d > max) return false
  }
  return true
}
