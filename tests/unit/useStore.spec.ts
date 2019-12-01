import { AnyAction, Store, createStore } from 'redux'
import CompositionApi, { createElement as h } from '@vue/composition-api'
import VueReduxHooks from '../../src'
import { createLocalVue } from '@vue/test-utils'
import { createReducer } from '@reduxjs/toolkit'

describe('useStore()', () => {
  it('returns store', () => {
    const localVue = createLocalVue()

    localVue.use(CompositionApi)
    const store = createStore(createReducer(0, {}))

    const { useStore } = VueReduxHooks(localVue, store)

    let injectedStore: Store<number, AnyAction>

    new localVue({
      components: {
        child: {
          setup() {
            injectedStore = useStore()

            return () => h('div')
          },
        },
      },
      setup: () => () => h('child'),
    }).$mount()

    expect(injectedStore).toStrictEqual(store)
  })
})
