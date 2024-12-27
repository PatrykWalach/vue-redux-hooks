import type { Action, Store } from 'redux'
import { type Ref } from 'vue-demi'

export type MapStateResult<This, S, M> = {
  [K in keyof M]: M[K] extends (state: S) => infer R
    ? (this: This) => R
    : M[K] extends keyof S
      ? (this: This) => S[M[K]]
      : never
}

export type ReduxContext<S, A extends Action> = {
  store: Store<S, A>
  state: Ref<S>
}

export type MapDispatchResult<This, M> = {
  [K in keyof M]: M[K] extends (
    this: any,
    dispatch: any,
    ...args: infer A
  ) => infer R
    ? (this: This, ...args: A) => R
    : never
}
