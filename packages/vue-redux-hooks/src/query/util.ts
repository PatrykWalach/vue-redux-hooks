import type { Action } from 'redux'
import type { Ref } from 'vue-demi'

export type Reactive<T> = T | Ref<T>

export type ReactiveRecord<T> = {
  [K in keyof T]: Reactive<T[K]>
}

/**
 * An Action type which accepts any other properties.
 * This is mainly for the use of the `Reducer` type.
 * This is not part of `Action` itself to prevent types that extend `Action` from
 * having an index signature.
 */
export interface UnknownAction extends Action {
  [extraProps: string]: unknown
}
