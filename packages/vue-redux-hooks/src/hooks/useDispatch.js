/** @import {Action, AnyAction, Dispatch} from 'redux' */
import { useStore } from './useStore'
/**
 * @overload
 * @template {Action} [A=AnyAction] Default is `AnyAction`
 * @returns {Dispatch<A>}
 */
/**
 * @overload
 * @template [TDispatch=Dispatch<AnyAction>] Default is `Dispatch<AnyAction>`
 * @returns {TDispatch}
 */
export function useDispatch() {
  return useStore().dispatch
}
