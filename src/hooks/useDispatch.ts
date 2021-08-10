import { Action, AnyAction, Dispatch } from 'redux'
import { ComponentCustomProperties } from 'vue-demi'
import { useStore } from './useStore'

export type GetAction = ComponentCustomProperties extends {
  $redux: { store: { dispatch: Dispatch<infer U> } }
}
  ? U
  : AnyAction

export function useDispatch<TDispatch = Dispatch<GetAction>>(): TDispatch
export function useDispatch<A extends Action = GetAction>(): Dispatch<A>
export function useDispatch() {
  return useStore().dispatch
}
