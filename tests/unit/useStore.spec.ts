import { createLocalVue } from './utils'
import { createStore } from 'redux'
import { useStore } from '../../src'

describe('useStore()', () => {
  it('returns store', () => {
    const reducer = (state = 0) => state + 1
    const store = createStore(reducer)

    const localVue = createLocalVue(store, () => {
      const injectedStore = useStore()

      return { injectedStore }
    })

    const vm: any = localVue.mount('')

    const [child] = vm.$children as {
      injectedStore: typeof store
    }[]

    expect(child.injectedStore).toStrictEqual(store)
  })
})
