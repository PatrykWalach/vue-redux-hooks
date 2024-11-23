import { computed, inject, unref } from 'vue-demi'
import { DefaultReduxContext, type ReduxContext } from '../install'
import type { Reactive } from '../query/util'

import type { Selector } from '@reduxjs/toolkit'
import type { GetAction, GetState } from './types'
import { assert } from './useStore'

export function useSelector<S = GetState, R = unknown>(
  select: Reactive<Selector<S, R>>,
) {
  const context = inject<ReduxContext<S, GetAction>>(DefaultReduxContext)

  assert(
    context,
    'Warning: no redux store was provided.\n\nPlease provide store preferably with vue install\n\napp.use(install(store))\n\nLearn more about vue-redux-hooks: https://github.com/PatrykWalach/vue-redux-hooks',
  )

  return computed(() => unref(select)(context.state.value))
}
