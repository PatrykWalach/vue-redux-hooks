import { useStore } from './useStore'

export const useDispatch = () => {
  const { dispatch } = useStore()
  return dispatch
}
