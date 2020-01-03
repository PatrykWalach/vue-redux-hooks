import { ReduxStore, useDispatch, useSelector } from '../../src'
import { createApp, h, provide } from 'vue'
import { createStore } from 'redux'

describe('useSelector()', () => {
  it('is reactive', () => {
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
              const state = useSelector((state: number) => state)

              return { dispatch, state }
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
      state: number
    }

    expect(child.state).toStrictEqual(0)
    child.dispatch()
    expect(child.state).toStrictEqual(1)
  })
})
