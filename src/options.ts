export function mapState<This, S = GetState>() {
  return <
    M extends Record<
      string,
      ((this: This, state: S) => unknown) | keyof M
    > = any,
  >(
    map: M,
  ) => {
    return Object.fromEntries(
      Object.entries(map).map(([key, value]) => {
        const computed =
          typeof value === 'string'
            ? function (this: any) {
                return this.$redux.state[value]
              }
            : typeof value === 'function'
            ? function (this: any) {
                return value.call(this, this.$redux.state)
              }
            : undefined
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

import { AnyAction, Dispatch } from 'redux'
import { GetAction } from './hooks/useDispatch'
import { GetState } from './hooks/useSelector'

export function mapDispatch<This, A extends AnyAction = GetAction>() {
  return <
    M extends Record<
      string,
      (this: This, dispatch: Dispatch<A>, ...arg: unknown[]) => unknown
    > = any,
  >(
    map: M,
  ) => {
    return Object.fromEntries(
      Object.entries(map).map(([key, value]) => {
        const computed =
          typeof value === 'function'
            ? function (this: any, ...args: unknown[]) {
                return value.call(this, this.$redux.dispatch, ...args)
              }
            : undefined
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
