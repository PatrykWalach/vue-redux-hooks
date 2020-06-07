import { InjectionKey } from 'vue'
import { Store } from 'redux'
export const ReduxStore: InjectionKey<Store> = Symbol('redux')
