/** @import {ReduxContext} from '../install' */
/** @import {Action, Store} from 'redux' */
/** @import {GetState, GetAction} from './types' */
import { inject } from 'vue-demi'
import { DefaultReduxContext } from '../install'
/**
 * @template [S=GetState] Default is `GetState`
 * @template {Action} [A=GetAction] Default is `GetAction`
 * @returns {Store<S, A>}
 */
export function useStore() {
  /** @type {typeof inject<ReduxContext<S, A> | undefined>} */
  const injectReduxContext = inject
  const ctx = injectReduxContext(DefaultReduxContext)
  assert(
    ctx,
    'Warning: no redux store was provided.\n\nPlease provide store preferably with vue install\n\napp.use(install(store))\n\nLearn more about vue-redux-hooks: https://github.com/PatrykWalach/vue-redux-hooks',
  )
  return ctx.store
}

/**
 * @param {unknown} condition
 * @param {string} message
 * @returns {asserts condition}
 */
export function assert(condition, message) {
  if (!condition) {
    throw message
  }
}
