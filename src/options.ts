export function mapState<
  S = ComponentCustomProperties extends {
    $reduxState: infer U
  }
    ? U
    : any,
  M extends Record<string, ((this: any, state: S) => unknown) | keyof M> = any,
>(map: M) {
  return Object.fromEntries(
    Object.entries(map).map(([key, value]) => {
      const computed =
        typeof value === 'string'
          ? function (this: any) {
              return this.$reduxState[value]
            }
          : typeof value === 'function'
          ? function (this: any) {
              return value.call(this, this.$reduxState)
            }
          : undefined
      return [key, computed]
    }),
  ) as {
    [K in keyof M]: M[K] extends (state: S) => infer R
      ? () => R
      : M[K] extends keyof S
      ? () => S[M[K]]
      : never
  }
}

import { AnyAction, Dispatch } from 'redux'
import { ComponentCustomProperties } from 'vue-demi'

export function mapDispatch<
  D extends Dispatch<AnyAction> = ComponentCustomProperties extends {
    $redux: { dispatch: infer U }
  }
    ? U extends Dispatch<AnyAction>
      ? U
      : Dispatch<AnyAction>
    : Dispatch<AnyAction>,
  M extends Record<
    string,
    (this: any, dispatch: D, ...arg: unknown[]) => unknown
  > = any,
>(map: M) {
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
    [K in keyof M]: M[K] extends (this: any, d: D, ...args: infer A) => infer R
      ? (...args: A) => R
      : never
  }
}
