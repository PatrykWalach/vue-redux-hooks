import { InjectionKey, inject, provide } from '@vue/composition-api'
import { Selector, useSelector as rawUseSelector } from './useSelector'

import { Store } from 'redux'
import Vue from 'vue'

export const install = <S extends Store>(app: typeof Vue, store: S) => {
  const key: InjectionKey<S> = Symbol('store')

  app.mixin({
    setup() {
      provide(key, store)
      return {}
    },
  })

  const useStore = () => inject(key) as S

  const useDispatch = () => {
    const { dispatch } = useStore()
    return dispatch
  }

  const useSelector = <R>(selector: Selector<ReturnType<S['getState']>, R>) =>
    rawUseSelector(useStore, selector)

  return {
    useDispatch,
    useSelector,
    useStore,
  }
}
