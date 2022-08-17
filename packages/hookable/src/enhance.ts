import { isArray, isFunction, isPlainObject } from './utils'
import { Hookable } from './hookable'
import { HookCallback } from './types'

// TODO: nest hooks
type NestedHooks = any;

function flat (option: Record<string, any>) {
  const flatHooks: Record<string, HookCallback> = {}

  function walk (option, paths: string[] = []) {
    for (const key in option) {
      if (Object.prototype.hasOwnProperty.call(option, key)) {
        const subHook = option[key]
        const name = [...paths, key].join(':')

        if (isPlainObject(subHook) || isArray(subHook)) {
          walk(subHook, [...paths, key])
        } else if (isFunction(subHook)) {
          flatHooks[name] = subHook
        }
      }
    }
  }

  walk(option)

  return flatHooks
}

export function flatHooks (configHooks: NestedHooks) {
  return flat(configHooks)
}

export function createHooks<T> () {
  return new Hookable<T>()
}

export function mergeHooks (...hooks: NestedHooks[]) {
  const finalHooks: Record<string, any> = {}

  for (const hook of hooks) {
    const flatenHook = flatHooks(hook)

    for (const [key, value] of Object.entries(flatenHook)) {
      if (finalHooks[key]) {
        finalHooks[key].push(value)
      } else {
        finalHooks[key] = [value]
      }
    }
  }

  return finalHooks
}
