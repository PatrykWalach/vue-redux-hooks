import type { Action, AnyAction, Dispatch } from 'redux'
import { useStore } from './useStore'

export function useDispatch<A extends Action = AnyAction>(): Dispatch<A>
export function useDispatch<TDispatch = Dispatch<AnyAction>>(): TDispatch
export function useDispatch() {
  return useStore().dispatch
}
