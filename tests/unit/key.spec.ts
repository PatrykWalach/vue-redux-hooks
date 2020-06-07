import { createApp } from 'vue'
import { ReduxStore } from '../../src'
import { createStore } from 'redux'
import { createCounter, Counter } from './utils'
import { configureStore } from '@reduxjs/toolkit'

describe('key.ts', () => {
  describe('ReduxStore', () => {
    let counter: Counter

    beforeEach(() => {
      counter = createCounter()
    })

    it('can provide redux store', () => {
      expect(() => {
        const store = createStore(counter.reducer)
        createApp(() => null).provide(ReduxStore, store)
      }).not.toThrow()
    })

    it('can provide custom store', () => {
      expect(() => {
        const store = configureStore({ reducer: counter.reducer })
        createApp(() => null).provide(ReduxStore, store)
      }).not.toThrow()
    })
  })
})
