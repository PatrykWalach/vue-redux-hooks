import { Dispatch, AnyAction } from 'redux'
import { useStore } from './useStore'
import { ComponentCustomProperties } from 'vue-demi'

export const useDispatch = <
  D extends Dispatch<AnyAction> = ComponentCustomProperties extends {
    $redux: { dispatch: infer U }
  }
    ? U
    : Dispatch<AnyAction>,
>() => {
  const { dispatch } = useStore<any>()
  return dispatch as D
}
