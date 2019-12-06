import CompositionApi from '@vue/composition-api'
import VueReduxHooks from '../../src'
import { createLocalVue } from '@vue/test-utils'
import { createReducer } from '@reduxjs/toolkit'
import { createStore } from 'redux'

describe('install()', () => {
  it('can be installed', () => {
    const localVue = createLocalVue()

    localVue.use(CompositionApi)
    const store = createStore(createReducer(0, {}))

    expect(() => {
      localVue.use(VueReduxHooks, store)
    }).not.toThrow()
  })
})
