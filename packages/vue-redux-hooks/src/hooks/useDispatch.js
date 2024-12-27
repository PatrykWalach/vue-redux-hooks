/** @import {Action, Dispatch} from 'redux' */
/** @import {UnknownAction} from '../query/types' */
import { useStore } from './useStore'
/**
 * @type {{
 * <A extends UnknownAction = UnknownAction>(): Dispatch<A>;
 * <TDispatch = Dispatch<UnknownAction>>(): TDispatch;
 * }}
 */
export const useDispatch = () => {
  return useStore().dispatch
}
