/** @import { ReduxContext } from '../install' */
/** @import { Reactive } from '../query/types' */
/** @import { AnyAction, Selector } from '@reduxjs/toolkit' */
/** @import { GetAction, GetState } from './types' */
import { computed, inject, unref } from 'vue-demi'
import { DefaultReduxContext } from '../install'
import { assert } from './useStore'
/**
 * @template [S=GetState]
 * @template [R=unknown]
 * @param {Reactive<Selector<S, R>>} select
 * @returns {any}
 */
export function useSelector(select) {
  /** @type {typeof inject<ReduxContext<S, AnyAction> | undefined>}*/
  const injectReduxContext = inject
  const context = injectReduxContext(DefaultReduxContext)
  assert(
    context,
    'Warning: no redux store was provided.\n\nPlease provide store preferably with vue install\n\napp.use(install(store))\n\nLearn more about vue-redux-hooks: https://github.com/PatrykWalach/vue-redux-hooks',
  )
  return computed(() => unref(select)(context.state.value))
}
