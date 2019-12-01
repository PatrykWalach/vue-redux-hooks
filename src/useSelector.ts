import { Ref, computed, onUnmounted, ref } from '@vue/composition-api'

import { Store } from 'redux'

export type Selector<S, R> = (state: S) => R

export const useSelector = <S = any, R = any>(
  useStore: () => Store<S>,
  select: Selector<S, R>,
) => {
  const { subscribe, getState } = useStore()

  const selector: Ref<R> = ref(select(getState()))

  let currentState: R

  const unsubscribe = subscribe(() => {
    const nextState = select(getState())

    if (nextState !== currentState) {
      currentState = nextState
      selector.value = currentState
    }
  })

  onUnmounted(unsubscribe)

  return computed(() => selector.value)
}
