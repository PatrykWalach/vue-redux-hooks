import { createLocalVue, mount, createCounter, Counter } from './utils'
import { useSelector } from '../../src'
import { watchEffect } from 'vue'
import { createStore } from '@reduxjs/toolkit'

describe('useSelector.ts', () => {
  describe('useSelector', () => {
    let counter: Counter
    let fn: jest.Mock<any, any>

    beforeEach(() => {
      fn = jest.fn()

      counter = createCounter()
    })

    it('is reactive', () => {
      const store = createStore(counter.reducer)

      type State = ReturnType<typeof store.getState>

      const app = createLocalVue(store, () => {
        const state = useSelector((state: State) => state)

        watchEffect(() => {
          fn(state.value)
        })

        store.dispatch(counter.actions.INCREMENT())

        return { state }
      })

      mount(app)

      expect(fn).toHaveBeenNthCalledWith(1, 0)
      expect(fn).toHaveBeenNthCalledWith(2, 1)
    })
  })
})
