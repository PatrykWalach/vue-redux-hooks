/** @type {import('vue-demi').InjectionKey<ReduxContext<import('./hooks/useSelector').GetState,import('./hooks/useDispatch').GetAction>>}*/
export const DefaultReduxContext = Symbol('redux-context')

import { computed, markRaw, reactive, shallowRef } from 'vue-demi'

/**
 * @template S
 * @template {import('redux').Action} [A=import('redux').AnyAction]
 * @param {import('redux').Store<S, A>} store
 * @param {import('vue-demi').InjectionKey<ReduxContext<S, A>>} injectionKey
 * @returns {(app: import('vue-demi').App) => void}
 */
export function install(store, injectionKey = DefaultReduxContext) {
  return function (app) {
    const { subscribe, getState } = store
    const state = shallowRef(getState())
    subscribe(() => {
      state.value = getState()
    })
    const readonlyState = computed(() => state.value)
    app.config.globalProperties.$redux = reactive({
      store: markRaw(store),
      state: readonlyState,
    })
    app.provide(injectionKey, { store, state: readonlyState })
  }
}

/**
 * @typedef {{
 *   store: import('redux').Store<S, A>
 *   state: import('vue-demi').Ref<S>
 * }} ReduxContext
 * @template S
 * @template {import('redux').Action} A
 */
