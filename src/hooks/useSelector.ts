import { ComponentCustomProperties, computed, inject } from 'vue-demi'
import { DefaultReduxContext, ReduxContext } from '../install'
import { GetAction } from './useDispatch'
import { assert } from './useStore'

export type GetState = ComponentCustomProperties extends {
  $redux: { state: infer U }
}
  ? U
  : any

export type Selector<S, R> = (state: S) => R

export function useSelector<S = GetState, R = unknown>(select: Selector<S, R>) {
  const context = inject<ReduxContext<S, GetAction>>(DefaultReduxContext)

  assert(
    context,
    'Warning: no redux store was provided.\n\nPlease provide store preferably with vue install\n\napp.use(install(store))\n\nLearn more about vue-redux-hooks: https://github.com/PatrykWalach/vue-redux-hooks',
  )

  return computed(() => select(context.state.value))
}
