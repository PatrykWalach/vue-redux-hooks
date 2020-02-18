import { ReduxStore, useDispatch } from '../../src'
import { h, provide } from 'vue'
import { createApp } from 'vue'
import { createStore } from 'redux'

describe('useDispatch()', () => {
  it('can dispatch an action', () => {
    const reducer = (state = 0) => state + 1
    const store = createStore(reducer)

    const Child = {
      render: () => h('div'),
      setup() {
        const dispatch = useDispatch()

        return { dispatch }
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
    }[]

    expect(store.getState()).toStrictEqual(0)
    child.dispatch()
    expect(store.getState()).toStrictEqual(1)
  })
})
