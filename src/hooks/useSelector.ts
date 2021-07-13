import { computed, onBeforeUnmount, shallowRef } from 'vue'
import { useStore } from './useStore'
import { Store } from 'redux'

export type Selector<S, R> = (state: S) => R

export const useSelector = <S = any, R = any>(select: Selector<S, R>) => {
  const { subscribe, getState } = useStore<Store<S>>()

  const state = shallowRef(getState())

  const unsubscribe = subscribe(() => {
    const nextState = getState()

    state.value = nextState
  })

  onBeforeUnmount(unsubscribe)

  return computed(() => select(state.value))
}
