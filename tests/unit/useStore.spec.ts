import { createLocalVue, mount } from './utils'
import { createStore } from 'redux'
import { useStore } from '../../src'

describe('useStore()', () => {
  it('returns store', () => {
    const reducer = (state = 0) => state + 1
    const store = createStore(reducer)

    const fn = jest.fn()

    const app = createLocalVue(store, () => {
      const injectedStore = useStore()
      fn(injectedStore)
      return { injectedStore }
    })

    mount(app)

    expect(fn).toBeCalledWith(store)
  })
})
