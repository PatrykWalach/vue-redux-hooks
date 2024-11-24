import type { Action, Dispatch } from 'redux'
import type { ComponentCustomProperties } from 'vue-demi'
import { useStore } from './useStore'
import type { UnknownAction } from '../query/util'

export type GetAction = ComponentCustomProperties extends {
  $redux: { store: { dispatch: Dispatch<infer U> } }
}
  ? U
  : UnknownAction

export function useDispatch<A extends Action = UnknownAction>(): Dispatch<A>
export function useDispatch<TDispatch = Dispatch<UnknownAction>>(): TDispatch
export function useDispatch() {
  return useStore().dispatch
}
