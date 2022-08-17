
export function isPlainObject (obj: unknown) {
  return toString.call(obj) === '[object Object]'
}

export function isFunction (fn: unknown) {
  return typeof fn === 'function'
}

export function isArray (arr: unknown) {
  return Array.isArray(arr)
}
