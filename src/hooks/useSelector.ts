import { computed, onBeforeUnmount, ref } from 'vue'
import { useStore } from './useStore'

export type Selector<S, R> = (state: S) => R

export const useSelector = <S = any, R = any>(
  select: Selector<S, R>,
  equalityFn: (nextState: R, currentState: R) => boolean = (
    nextState,
    currentState,
  ) => nextState === currentState,
) => {
  const { subscribe, getState } = useStore()

  const selector = ref(select(getState()))

  const unsubscribe = subscribe(() => {
    const nextState = select(getState())

    if (!equalityFn(nextState, selector.value)) {
      selector.value = nextState
    }
  })

  onBeforeUnmount(unsubscribe)

  return computed(() => selector.value)
}
