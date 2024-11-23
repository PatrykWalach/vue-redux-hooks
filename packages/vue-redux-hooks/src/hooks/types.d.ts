import type { AnyAction, Dispatch } from 'redux'
import type { ComponentCustomProperties } from 'vue-demi'

export type GetState = ComponentCustomProperties extends {
  $redux: { state: infer U }
}
  ? U
  : unknown

export type Selector<S, R> = (state: S) => R

export type GetAction = ComponentCustomProperties extends {
  $redux: { store: { dispatch: Dispatch<infer U> } }
}
  ? U
  : AnyAction
