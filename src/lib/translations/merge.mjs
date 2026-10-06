// Pure merge logic for admin-edited translation overrides. Plain ESM so it can
// be tested with `node --test` and reused by scripts.

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)

export function flattenTranslation(locale) {
  const out = {}
  for (const [page, tree] of Object.entries(locale)) {
    const leaves = {}
    const walk = (node, prefix) => {
      for (const [key, value] of Object.entries(node)) {
        const path = prefix ? `${prefix}.${key}` : key
        if (isObject(value)) walk(value, path)
        else leaves[path] = value
      }
    }
    if (isObject(tree)) walk(tree, '')
    out[page] = leaves
  }
  return out
}

function acceptsArray(shippedArr, overrideArr) {
  if (shippedArr.length === 0 || overrideArr.length === 0) return false
  const first = shippedArr[0]
  if (typeof first === 'string') return overrideArr.every((i) => typeof i === 'string')
  if (isObject(first)) {
    const keys = Object.keys(first)
    return overrideArr.every((i) => isObject(i) && keys.every((k) => typeof i[k] === 'string'))
  }
  return false
}

function accepts(current, value) {
  if (typeof current === 'string') return typeof value === 'string'
  if (Array.isArray(current)) return Array.isArray(value) && acceptsArray(current, value)
  return false
}

export function mergeOverrides(shipped, overrides) {
  const out = structuredClone(shipped)
  if (!isObject(overrides)) return out
  for (const [page, paths] of Object.entries(overrides)) {
    if (!Object.hasOwn(out, page) || !isObject(out[page]) || !isObject(paths)) continue
    for (const [path, value] of Object.entries(paths)) {
      const parts = path.split('.')
      let node = out[page]
      for (let i = 0; i < parts.length - 1 && node !== undefined; i++) {
        node = isObject(node) && Object.hasOwn(node, parts[i]) ? node[parts[i]] : undefined
      }
      const last = parts[parts.length - 1]
      if (!isObject(node) || !Object.hasOwn(node, last)) continue
      if (accepts(node[last], value)) node[last] = structuredClone(value)
    }
  }
  return out
}
