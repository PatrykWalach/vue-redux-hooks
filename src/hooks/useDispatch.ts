import { Dispatch, AnyAction } from 'redux'
import { useStore } from './useStore'

export const useDispatch = <
  D extends Dispatch<AnyAction> = Dispatch<AnyAction>
>() => {
  const { dispatch } = useStore()
  return dispatch as D
}
