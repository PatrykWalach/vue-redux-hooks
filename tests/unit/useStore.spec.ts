import { ReduxStore, useStore } from '../../src'
import { createApp, h, provide } from 'vue'

import { createStore } from 'redux'

describe('useStore()', () => {
  it('returns store', () => {
    const reducer = (state = 0) => state + 1
    const store = createStore(reducer)

    const Child = {
      render: () => h('div'),
      setup() {
        const injectedStore = useStore()

        return { injectedStore }
      },
    }

    const localVue = createApp({
      setup: () => {
        provide(ReduxStore, store)
        return () => h(Child)
      },
    })

    const vm: any = localVue.mount('')

    const [child] = vm.$children as {
      injectedStore: typeof store
    }[]

    expect(child.injectedStore).toStrictEqual(store)
  })
})
