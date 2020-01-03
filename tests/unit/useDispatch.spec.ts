import { ReduxStore, useDispatch } from '../../src'
import { h, provide } from 'vue'
import { createApp } from 'vue'
import { createStore } from 'redux'

describe('useDispatch()', () => {
  it('can dispatch an action', () => {
    const localVue = createApp()

    const reducer = (state = 0) => state + 1
    const store = createStore(reducer)

    const vm: any = localVue.mount(
      {
        components: {
          child: {
            render: () => h('div'),
            setup() {
              const dispatch = useDispatch()

              return { dispatch }
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
      dispatch(): void
    }

    expect(store.getState()).toStrictEqual(0)
    child.dispatch()
    expect(store.getState()).toStrictEqual(1)
  })
})
