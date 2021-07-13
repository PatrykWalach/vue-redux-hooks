import { Ref } from 'vue-demi'

export type Reactive<T> = Ref<T> | T

export type ReactiveRecord<T> = {
  [K in keyof T]: Reactive<T[K]>
}
