import CompositionApi, { createElement as h } from '@vue/composition-api'
import VueReduxHooks from '../../src'
import { createLocalVue } from '@vue/test-utils'
import { createReducer } from '@reduxjs/toolkit'
import { createStore } from 'redux'

describe('useStore()', () => {
  it('returns store', () => {
    const localVue = createLocalVue()

    localVue.use(CompositionApi)
    const store = createStore(createReducer(0, {}))

    const { useStore } = VueReduxHooks(localVue, store)

    const vm = new localVue({
      components: {
        child: {
          render: () => h('div'),
          setup() {
            const injectedStore = useStore()

            return { injectedStore }
          },
        },
      },
      setup: () => () => h('child'),
    }).$mount()

    const child = (vm.$children[0] as unknown) as {
      injectedStore: typeof store
    }

    expect(child.injectedStore).toStrictEqual(store)
  })
})
