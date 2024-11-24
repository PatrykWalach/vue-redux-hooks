/** @import {Action, AnyAction, Dispatch} from 'redux' */
import { useStore } from './useStore'
/**
 * @template {Action} [A=AnyAction] Default is `AnyAction`
 * @overload
 * @returns {Dispatch<A>}
 */
/**
 * @template [TDispatch=Dispatch<AnyAction>] Default is `Dispatch<AnyAction>`
 * @overload
 * @returns {TDispatch}
 */
export function useDispatch() {
  return useStore().dispatch
}
