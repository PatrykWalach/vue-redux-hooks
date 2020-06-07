import { Ref, computed, onUnmounted, ref } from '@vue/composition-api'
import { useStore } from './useStore'

export type Selector<S, R> = (state: S) => R

export const useSelector = <S = any, R = any>(select: Selector<S, R>) => {
  const { subscribe, getState } = useStore()

  const selector: Ref<R> = ref(select(getState()))

  const unsubscribe = subscribe(() => {
    selector.value = select(getState())
  })

  onUnmounted(unsubscribe)

  return computed(() => selector.value)
}
