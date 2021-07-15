export const ReduxStore = Symbol('redux')
export const ReduxState = Symbol('redux-state')

import { Store } from 'redux'
import { App, computed, shallowRef } from 'vue-demi'

export const install = (store: Store<any>) => (app: App) => {
  app.config.globalProperties.$redux = store
  app.provide(ReduxStore, store)

  const { subscribe, getState } = store

  const state = shallowRef(getState())

  subscribe(() => {
    state.value = getState()
  })

  const readonlyState = computed(() => state.value)

  app.mixin({
    computed: {
      $reduxState() {
        return readonlyState.value
      },
    },
  })

  app.provide(ReduxState, readonlyState)
}
