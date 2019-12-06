import { Store } from 'redux'
import { useStore } from './useStore'

export const useDispatch = <S extends Store = Store>() => {
  const { dispatch } = useStore<S>()
  return dispatch
}
