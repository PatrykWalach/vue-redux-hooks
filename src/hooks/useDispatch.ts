import { AnyAction, Dispatch } from 'redux'
import { ComponentCustomProperties } from 'vue-demi'
import { useStore } from './useStore'

export function useDispatch<
  D extends Dispatch<AnyAction> = ComponentCustomProperties extends {
    $redux: { dispatch: infer U }
  }
    ? U extends Dispatch<AnyAction>
      ? U
      : Dispatch<AnyAction>
    : Dispatch<AnyAction>,
>() {
  const { dispatch } = useStore<any>()
  return dispatch as D
}
