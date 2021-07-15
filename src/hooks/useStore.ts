import { ReduxState, ReduxStore } from '../install'
import { Store } from 'redux'
import { inject, Ref, ComponentCustomProperties } from 'vue-demi'

export const useStore = <
  S extends Store = ComponentCustomProperties extends {
    $redux: infer U
  }
    ? U extends Store
      ? U
      : Store
    : Store,
>() => {
  const store = inject<S>(ReduxStore)
  assert(
    store,
    'Warning: no redux store was provided.\n\nPlease provide store preferably with vue install\n\napp.use(install(store))\n\nLearn more about vue-redux-hooks: https://github.com/PatrykWalach/vue-redux-hooks',
  )
  return store
}

export const useState = <
  S = ComponentCustomProperties extends {
    $reduxState: infer U
  }
    ? U
    : any,
>() => {
  const state = inject<Ref<S>>(ReduxState)
  assert(
    state,
    'Warning: no redux state was provided.\n\nPlease provide state preferably with vue install\n\napp.use(install(store))\n\nLearn more about vue-redux-hooks: https://github.com/PatrykWalach/vue-redux-hooks',
  )
  return state
}

function assert(condition: any, message: string): asserts condition {
  if (!condition) {
    throw message
  }
}
