import { ComputedRef } from 'vue-demi'

export type Reactive<T> = ComputedRef<T> | T

export type ReactiveRecord<T> = {
  [K in keyof T]: Reactive<T[K]>
}
