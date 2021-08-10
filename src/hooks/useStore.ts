import { Action, Store } from 'redux'
import { inject } from 'vue-demi'
import { DefaultReduxContext, ReduxContext } from '../install'
import { GetAction } from './useDispatch'
import { GetState } from './useSelector'

export function useStore<S = GetState, A extends Action = GetAction>(): Store<
  S,
  A
> {
  const store = inject<ReduxContext<S, A>>(DefaultReduxContext)
  assert(
    store,
    'Warning: no redux store was provided.\n\nPlease provide store preferably with vue install\n\napp.use(install(store))\n\nLearn more about vue-redux-hooks: https://github.com/PatrykWalach/vue-redux-hooks',
  )
  return store.store
}

export function assert(condition: any, message: string): asserts condition {
  if (!condition) {
    throw message
  }
}
