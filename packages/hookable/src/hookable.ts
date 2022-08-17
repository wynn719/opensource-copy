import { flatHooks } from './enhance'
import { isFunction } from './utils'
import { HookCallback, Hooks, HookKeys, ConfigHooks } from './types'

interface DeprecateHookOption {
  to: string;
  message?: string;
}

type DeprecateHooks = Record<string, DeprecateHookOption>;

// Create a HookCallback type that only exists in specified hook list, really a nice code.
type InferCallback<HooksT, HookName extends keyof HooksT> = HooksT[HookName] extends HookCallback ? HooksT[HookName] : never;

export class Hookable<HooksT, HookNameT extends HookKeys<HooksT> = HookKeys<HooksT>> {
  private _hooks: Hooks
  private _deprecatedHooks: DeprecateHooks

  constructor () {
    this._hooks = {}
    this._deprecatedHooks = {}
  }

  private validateHookName (name: string) {
    return typeof name === 'string' && name.trim().length > 0
  }

  private findDeprecatedTo (name: unknown) {
    const oldName = name as string
    const getRealHookName = (name: string): string | undefined => {
      const deprecatedInfo = this._deprecatedHooks[name]
      const newName = deprecatedInfo ? deprecatedInfo.to : undefined

      if (newName && this._deprecatedHooks[newName]) {
        return getRealHookName(newName)
      }

      return newName
    }

    const newName = getRealHookName(oldName)

    if (newName) {
      const customMessage = this._deprecatedHooks[oldName].message
      const message = customMessage || `${oldName} hook has been deprecated, please use ${newName}`
      console.warn(message)
    }

    return newName || oldName
  }

  hook<HookName extends HookNameT> (name: HookName, fn: InferCallback<HooksT, HookName>) {
    if (!this.validateHookName(name) || !isFunction(fn)) { return () => {} }

    const hookName = this.findDeprecatedTo(name)

    // // Before: too verbose just want to insert an array item that may not exist
    // if (this._hooks[hookName] && this._hooks[hookName].length) {
    //   this._hooks[hookName].push(fn);
    // } else {
    //   this._hooks[hookName] = [fn];
    // }

    // After: short way do this
    this._hooks[hookName] = this._hooks[hookName] || []
    this._hooks[hookName].push(fn)

    return () => {
      if (fn) {
        this.removeHook(name, fn)
        fn = null // Free memory, because here a closure is created for fn
      }
    }
  }

  hookOnce<HookName extends HookNameT> (name: HookName, fn: HookCallback) {
    // @ts-ignore
    let remove = this.hook(name, (...args) => {
      Promise.resolve(fn(...args)).then(() => {
        remove()
        remove = null // Free memory
      })
    })

    return remove
  }

  addHooks (configHooks: ConfigHooks<HooksT>) {
    const hooks = flatHooks(configHooks)

    for (const [hookName, hookFn] of Object.entries(hooks)) {
      // @ts-ignore
      this.hook(hookName as HookNameT, hookFn)
    }

    return () => {
      this.removeHooks(configHooks)
      configHooks = null // Free momory
    }
  }

  callHook<HookName extends HookNameT> (name: HookName, ...args: any[]) {
    if (!this.validateHookName(name)) { return }

    const hook = this._hooks[name]

    if (hook) {
      return hook.reduce(
        (prev, crt) => prev.then(() => crt.apply(undefined, args)),
        Promise.resolve()
      )
    }
  }

  callHookParallel<HookName extends HookNameT> (name: HookName, ...args: any[]) {
    if (!this.validateHookName(name)) { return }

    const hook = this._hooks[name]

    if (hook) {
      return Promise.all(hook.map(fn => fn.apply(undefined, args)))
    }
  }

  callHookWith (syncCaller: any, name: string) {
    syncCaller(this._hooks[name])
  }

  deprecateHook (old: string, name: string | DeprecateHookOption) {
    const newHookName = typeof name === 'string' ? name : name.to

    if (!this.validateHookName(old)) { return }
    if (!this.validateHookName(newHookName)) { return }

    const deprecatedInfo = typeof name === 'string'
      ? {
          to: name,
          message: ''
        }
      : name

    this._hooks[old] = undefined
    this._deprecatedHooks[old] = deprecatedInfo
  }

  deprecateHooks (deprecatedHooks: Record<HookNameT, DeprecateHooks>) {
    for (const [to, from] of Object.entries(deprecatedHooks)) {
      this.deprecateHook(to, from as any)
    }
  }

  removeHook<HookName extends HookNameT> (name: HookName, fn: HookCallback) {
    if (this._hooks[name]) {
      const index = this._hooks[name].findIndex((hookFn) => {
        return hookFn.name === fn.name && hookFn.toString() === fn.toString()
      })

      if (index !== -1) {
        this._hooks[name].splice(index, 1)
      }

      if (this._hooks[name].length === 0) {
        delete this._hooks[name]
      }
    }
  }

  removeHooks (configHooks: ConfigHooks<HooksT>) {
    const hooks = flatHooks(configHooks)

    for (const [name, fn] of Object.entries(hooks)) {
      this.removeHook(name as HookNameT, fn)
    }
  }
}
