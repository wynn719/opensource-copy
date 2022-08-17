import { createHooks, Hookable } from '../src'

/**
 * Basic
 */

console.log('---------- Test for a defined hook type ----------')

const hookable = new Hookable<{
  'async cb':() => Promise<void>;
  'cb': () => void;
}>()

hookable.hook('cb', () => {
  console.log(111, Date.now())
  setTimeout(() => {
    console.log(121)
  }, 2000)
})
hookable.hook('cb', () => {
  console.log(112, Date.now())
  setTimeout(() => {
    console.log(122)
  }, 1500)
})
hookable.hook('cb', () => {
  console.log(113, Date.now())
  setTimeout(() => {
    console.log(123)
  }, 1800)
})
hookable.hook('async cb', async () => {
  await new Promise((resolve) => {
    setTimeout(() => {
      console.log(222)
      resolve(null)
    }, 2000)
  })
})
hookable.hook('async cb', async () => {
  await new Promise((resolve) => {
    setTimeout(() => {
      console.log(223)
      resolve(null)
    }, 2000)
  })
})
hookable.hook('async cb', async () => {
  await new Promise((resolve) => {
    setTimeout(() => {
      console.log(224)
      resolve(null)
    }, 2000)
  })
})
hookable.callHook('cb')
hookable.callHookParallel('async cb')

/**
 * Test for a defined hook callback type
 */

console.log('---------- Test for a defined hook callback type ----------')

const hookableWithTypes = createHooks<{
  foo:() => void
  bar:(_args: string[]) => void
}>()

hookableWithTypes.hook('foo', () => console.log('foo'))
hookableWithTypes.hook('bar', _args => console.log('bar', _args))

hookableWithTypes.callHook('foo')
hookableWithTypes.callHook('bar')
