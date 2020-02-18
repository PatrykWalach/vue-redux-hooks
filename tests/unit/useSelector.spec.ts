import { ReduxStore, useDispatch, useSelector } from '../../src'
import { createApp, h, provide } from 'vue'
import { createStore } from 'redux'

describe('useSelector()', () => {
  it('is reactive', () => {
    const reducer = (state = 0) => state + 1
    const store = createStore(reducer)

    const Child = {
      render: () => h('div'),
      setup() {
        const dispatch = useDispatch()
        const state = useSelector((state: number) => state)

        return { dispatch, state }
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
      dispatch(): void
      state: number
    }[]

    expect(child.state).toStrictEqual(0)
    child.dispatch()
    expect(child.state).toStrictEqual(1)
  })
})
