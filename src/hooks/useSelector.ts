import { computed, onBeforeUnmount, shallowRef } from 'vue'
import { useStore } from './useStore'
import { Store } from 'redux'

export type Selector<S, R> = (state: S) => R

export const useSelector = <S = any, R = any>(select: Selector<S, R>) => {
  const { subscribe, getState } = useStore<Store<S>>()

  const selector = shallowRef(select(getState()))

  const unsubscribe = subscribe(() => {
    const nextState = select(getState())

    selector.value = nextState
  })

  onBeforeUnmount(unsubscribe)

  return computed(() => selector.value)
}
