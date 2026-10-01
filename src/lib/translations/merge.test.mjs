import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { mergeOverrides, flattenTranslation } from './merge.mjs'

const shipped = () => ({
  hero: { title: 'Hello', tags: ['a', 'b'], cards: [{ name: 'x', body: 'y' }] },
  nav: { home: 'Home', deep: { label: 'Deep' } },
})

test('replaces a leaf string', () => {
  const out = mergeOverrides(shipped(), { hero: { title: 'Hi' }, nav: { 'deep.label': 'D2' } })
  assert.equal(out.hero.title, 'Hi')
  assert.equal(out.nav.deep.label, 'D2')
  assert.equal(out.nav.home, 'Home')
})

test('ignores an unknown page and an unknown path', () => {
  const out = mergeOverrides(shipped(), { nope: { a: 'x' }, hero: { missing: 'x', 'title.sub': 'x' } })
  assert.deepEqual(out, shipped())
})

test('ignores a string over an array and an array over a string', () => {
  const out = mergeOverrides(shipped(), { hero: { tags: 'str', title: ['a'] } })
  assert.deepEqual(out, shipped())
})

test('keeps the shipped array when item kinds differ', () => {
  const cases = [
    { tags: [{ name: 'x' }] },
    { tags: ['ok', 1] },
    { cards: ['str'] },
    { cards: [{ name: 'x' }] },
    { cards: [{ name: 'x', body: 5 }] },
    { cards: [{ name: 'x', body: 'y' }, null] },
  ]
  for (const c of cases) {
    assert.deepEqual(mergeOverrides(shipped(), { hero: c }), shipped(), JSON.stringify(c))
  }
})

test('accepts a matching array of objects', () => {
  const cards = [{ name: 'n1', body: 'b1', extra: 'e' }, { name: 'n2', body: 'b2' }]
  const tags = ['q']
  const out = mergeOverrides(shipped(), { hero: { cards, tags } })
  assert.deepEqual(out.hero.cards, cards)
  assert.deepEqual(out.hero.tags, tags)
})

test('rejects an empty override array', () => {
  assert.deepEqual(mergeOverrides(shipped(), { hero: { tags: [], cards: [] } }), shipped())
})

test('does not mutate the shipped object', () => {
  const s = shipped()
  const out = mergeOverrides(s, { hero: { title: 'Hi', tags: ['z'] } })
  assert.deepEqual(s, shipped())
  assert.notEqual(out, s)
  assert.notEqual(out.hero, s.hero)
})

test('returns an equal copy for empty overrides', () => {
  const s = shipped()
  const out = mergeOverrides(s, {})
  assert.deepEqual(out, s)
  assert.notEqual(out, s)
  out.hero.tags.push('mut')
  assert.deepEqual(s, shipped())
})

test('keeps risky text as a plain string', () => {
  const risky = '<script>alert("x")</script> \'quoted\' "double"'
  const out = mergeOverrides(shipped(), { hero: { title: risky } })
  assert.equal(out.hero.title, risky)
  assert.equal(typeof out.hero.title, 'string')
})

test('flattenTranslation keeps arrays as single leaves and paths relative to the page', () => {
  const flat = flattenTranslation(shipped())
  assert.deepEqual(flat, {
    hero: { title: 'Hello', tags: ['a', 'b'], cards: [{ name: 'x', body: 'y' }] },
    nav: { home: 'Home', 'deep.label': 'Deep' },
  })
})

test('en mn ko have identical flattened keys', () => {
  const load = (l) => JSON.parse(readFileSync(new URL(`../../locales/${l}.json`, import.meta.url), 'utf8'))
  const keys = (l) => {
    const flat = flattenTranslation(load(l))
    return Object.entries(flat).flatMap(([p, m]) => Object.keys(m).map((k) => `${p}/${k}`)).sort()
  }
  const en = keys('en')
  assert.ok(en.length > 100)
  assert.deepEqual(keys('mn'), en)
  assert.deepEqual(keys('ko'), en)
})
