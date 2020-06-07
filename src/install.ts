import { InjectionKey, provide } from '@vue/composition-api'
import { Store } from 'redux'
import Vue from 'vue'

export const key: InjectionKey<Store> = Symbol('redux')

export const install = <S extends Store>(app: typeof Vue, store: S) =>
  app.mixin({
    setup() {
      provide(key, store)
      return {}
    },
  })
