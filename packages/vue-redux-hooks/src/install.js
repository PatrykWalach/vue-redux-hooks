/** @import {Action, AnyAction, Store} from 'redux' */
/** @import {App, InjectionKey, Ref} from 'vue-demi' */
/** @import {GetAction, GetState} from './hooks/types' */
/** @import {ReduxContext} from './types' */
import { computed, markRaw, reactive, shallowRef } from 'vue-demi'

/** @type {InjectionKey<ReduxContext<GetState, GetAction>>} */
export const DefaultReduxContext = Symbol('redux-context')
/**
 * @template S
 * @template {Action} [A=AnyAction] Default is `AnyAction`
 * @param {Store<S, A>} store
 * @param {InjectionKey<ReduxContext<S, A>>} [injectionKey=DefaultReduxContext]
 *   Default is `DefaultReduxContext`
 * @returns {(app: App) => void}
 */
export const install =
  (store, injectionKey = DefaultReduxContext) =>
  (app) => {
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
