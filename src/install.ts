import { Store } from 'redux'
import Vue from 'vue'
import { provide } from '@vue/composition-api'

export const key = Symbol('redux')

export const install = <S extends Store>(app: typeof Vue, store: S) =>
  app.mixin({
    setup() {
      provide(key, store)
      return {}
    },
  })
