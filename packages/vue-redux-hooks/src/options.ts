export function mapState<This, S = GetState>() {
  return <
    M extends Record<
      string,
      ((this: This, state: S) => unknown) | keyof S
    > = any,
  >(
    map: M,
  ) => {
    return Object.fromEntries(
      Object.entries(map).map(([key, value]) => {
        const computed =
          typeof value === 'function'
            ? function (this: any) {
                return value.call(this, this.$redux.state)
              }
            : function (this: any) {
                return this.$redux.state[value]
              }
        return [key, computed]
      }),
    ) as {
      [K in keyof M]: M[K] extends (state: S) => infer R
        ? (this: This) => R
        : M[K] extends keyof S
          ? (this: This) => S[M[K]]
          : never
    }
  }
}

import type { GetAction } from './hooks/useDispatch'
import type { GetState } from './hooks/useSelector'
import type { UnknownAction } from './query/util'

export function mapDispatch<This, A extends UnknownAction = GetAction>() {
  return <M extends Record<string, (...args: unknown[]) => A> = any>(
    map: M,
  ) => {
    return Object.fromEntries(
      Object.entries(map).map(([key, value]) => {
        if (typeof value !== 'function') {
          throw new TypeError('mapDispatch must be a function')
        }

        const computed = function (this: any, ...args: unknown[]) {
          return this.$redux.store.dispatch(value.call(this, ...args))
        }

        return [key, computed]
      }),
    ) as {
      [K in keyof M]: M[K] extends (
        this: any,
        dispatch: any,
        ...args: infer A
      ) => infer R
        ? (this: This, ...args: A) => R
        : never
    }
  }
}
