import { Ref, reactive, computed } from 'vue-demi'

export type Reactive<T> = Ref<T> | T

export type ReactiveRecord<T> = {
  [K in keyof T]: Reactive<T[K]>
}

export function refToReactive<O, K extends keyof O>(
  result: Ref<O>,
  keys: K[],
): O {
  return reactive(
    Object.fromEntries(
      keys.map((key) => [key, computed(() => result.value[key])]),
    ),
  ) as O
}
