import { createLocalVue, mount, createCounter, Counter } from './utils'
import { createStore } from 'redux'
import { useStore } from '../../src'
import { configureStore } from '@reduxjs/toolkit'

describe('useStore.ts', () => {
  describe('useStore', () => {
    describe('uses', () => {
      let counter: Counter
      let fn: jest.Mock<any, any>

      beforeEach(() => {
        fn = jest.fn()

        counter = createCounter()
      })

      it('returns store', () => {
        const store = createStore(counter.reducer)

        const app = createLocalVue(store, () => {
          const injectedStore = useStore()
          fn(injectedStore)
          return { injectedStore }
        })

        mount(app)

        expect(fn).toBeCalledWith(store)
      })

      it('can by typed', () => {
        const store = configureStore({ reducer: counter.reducer })
        type AppStore = typeof store

        const app = createLocalVue(store, () => {
          const injectedStore = useStore<AppStore>()
          fn(injectedStore)
          injectedStore.dispatch((dispatch) => {
            dispatch(counter.actions.INCREMENT())
          })
          return { injectedStore }
        })

        mount(app)

        expect(fn).toBeCalledWith(store)
        expect(store.getState()).toStrictEqual(1)
      })
    })

    describe('errors', () => {
      let warnMock: jest.Mock<any, any>

      const warn = console.warn

      beforeEach(() => {
        warnMock = jest.fn()
        console.warn = warnMock
      })

      afterAll(() => {
        console.warn = warn
      })

      it('errors without store', () => {
        useStore()
        expect(warnMock).toBeCalledWith(expect.any(String))
      })
    })
  })
})
