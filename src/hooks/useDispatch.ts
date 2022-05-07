import { Action, AnyAction, Dispatch } from 'redux'
import { ComponentCustomProperties } from 'vue-demi'
import { useStore } from './useStore'

export type GetDispatch = ComponentCustomProperties extends {
  $redux: { store: { dispatch: infer U } }
}
  ? U
  : Dispatch<AnyAction>

export function useDispatch<A extends Action = AnyAction>(): Dispatch<A>
export function useDispatch<TDispatch = GetDispatch>(): TDispatch
export function useDispatch() {
  return useStore().dispatch
}
