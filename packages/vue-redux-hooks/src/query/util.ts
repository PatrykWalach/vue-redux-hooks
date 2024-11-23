import type { Ref } from 'vue-demi'

export type Reactive<T> = T | Ref<T>

export type ReactiveRecord<T> = {
  [K in keyof T]: Reactive<T[K]>
}
