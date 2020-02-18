import { createLocalVue } from './utils'
import { createStore } from 'redux'
import { useDispatch } from '../../src'

describe('useDispatch()', () => {
  it('can dispatch an action', () => {
    const reducer = (state = 0) => state + 1
    const store = createStore(reducer)

    const localVue = createLocalVue(store, () => {
      const dispatch = useDispatch()

      return { dispatch }
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
