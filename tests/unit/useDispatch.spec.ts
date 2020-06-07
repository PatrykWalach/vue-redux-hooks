import { createLocalVue, mount, Counter, createCounter } from './utils'
import { useDispatch } from '../../src'
import { configureStore, createStore } from '@reduxjs/toolkit'

describe('useDispatch.ts', () => {
  describe('useDispatch', () => {
    let counter: Counter

    beforeEach(() => {
      counter = createCounter()
    })

    it('can dispatch an action', () => {
      const store = createStore(counter.reducer)

      const app = createLocalVue(store, () => {
        const dispatch = useDispatch()
        dispatch(counter.actions.INCREMENT())
        return { dispatch }
      })

      mount(app)

      expect(store.getState()).toStrictEqual(1)
    })

    it('can by typed', () => {
      const store = configureStore({ reducer: counter.reducer })

      type AppDispatch = typeof store.dispatch

      const app = createLocalVue(store, () => {
        const dispatch = useDispatch<AppDispatch>()
        dispatch((dispatch) => dispatch(counter.actions.INCREMENT()))
        return { dispatch }
      })

      mount(app)

      expect(store.getState()).toStrictEqual(1)
    })
  })
})
