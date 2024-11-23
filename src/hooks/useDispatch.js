/** @import { Action, AnyAction, Dispatch } from 'redux' */
import { useStore } from './useStore'
/**
 * @template {Action} [A=AnyAction]
 * @overload
 * @returns {Dispatch<A>}
 */
/**
 * @template [TDispatch=Dispatch<AnyAction>]
 * @overload
 * @returns {TDispatch}
 */
export function useDispatch() {
  return useStore().dispatch
}
