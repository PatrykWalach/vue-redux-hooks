import { ReduxStore, useStore } from '../../src'
import { createApp, h, provide } from 'vue'

import { createStore } from 'redux'

describe('useStore()', () => {
  it('returns store', () => {
    const localVue = createApp()

    const reducer = (state = 0) => state + 1
    const store = createStore(reducer)

    const vm: any = localVue.mount(
      {
        components: {
          child: {
            render: () => h('div'),
            setup() {
              const injectedStore = useStore()

              return { injectedStore }
            },
          },
        },
        setup: () => {
          provide(ReduxStore, store)
          return () => h('child')
        },
      },
      '',
    )

    const child = vm.$children[0] as {
      injectedStore: typeof store
    }

    expect(child.injectedStore).toStrictEqual(store)
  })
})
