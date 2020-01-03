import { Ref, computed, onUnmounted, ref } from '@vue/composition-api'
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

  const selector: Ref<R> = ref(select(getState()))

  let currentState: R

  const unsubscribe = subscribe(() => {
    const nextState = select(getState())

    if (!equalityFn(nextState, currentState)) {
      currentState = nextState
      selector.value = currentState
    }
  })

  onUnmounted(unsubscribe)

  return computed(() => selector.value)
}
