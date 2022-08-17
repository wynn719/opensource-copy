import { expectTypeOf } from 'expect-type'
import { createHooks } from '../src'
// import type { HookCallback } from '../src/types'

describe('hook types', () => {
  test('correctly handles non-nested hooks', () => {
    const hooks = createHooks<{ foo:() => true, bar: (_arg: string) => 42 }>()

    expectTypeOf(hooks.hook).parameter(0).not.toBeAny()
    expectTypeOf(hooks.hook).parameter(0).toEqualTypeOf<'foo' | 'bar'>()

    // @ts-expect-error
    hooks.hook('foo', _param => true)
  })

  // test('handles nested hooks', () => {
  //   const hooks = createHooks<{
  //     'namespace:foo':(arg: number) => void
  //     bar: (_arg: string) => void
  //     'namespace:baz': (arg: '42') => void
  //   }>()

  //   // should be valid
  //   hooks.addHooks({ namespace: { foo: (_arg) => { }, baz: (_arg) => { } }, bar: (_arg) => { }, 'namespace:foo': () => { } })
  //   // @ts-expect-error
  //   hooks.addHooks({ a: (_arg) => { } })
  //   // @ts-expect-error
  //   hooks.addHooks({ namespace: { nonexistent: (_arg) => { } } })
  // })

  // test('handles nested hooks with signature', () => {
  //   const hooks = createHooks<{
  //     [key: string]: HookCallback
  //     'namespace:foo':(arg: number) => void
  //     bar: (_arg: string) => void
  //   }>()

  //   // should both be valid
  //   hooks.addHooks({ namespace: { foo: (_arg) => { } }, bar: (_arg) => { }, 'namespace:foo': () => { } })
  //   hooks.addHooks({ namespace: { nothing: (_arg) => { } } })
  //   hooks.addHooks({ nothing: (_arg) => { } })
  // })
})
