import { computed, ComponentCustomProperties } from 'vue-demi'

import { useState } from './useStore'

export type Selector<S, R> = (state: S) => R

export function useSelector<
  S = ComponentCustomProperties extends { $reduxState: infer U } ? U : any,
  R = any,
>(select: Selector<S, R>) {
  const state = useState<S>()

  return computed(() => select(state.value))
}
