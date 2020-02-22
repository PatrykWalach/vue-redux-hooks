import { createLocalVue, createTestStore } from './utils'
import { useSelector } from '../../src'
import { watchEffect } from 'vue'

describe('useSelector()', () => {
  it('is reactive', () => {

    const [store, INCREMENT] = createTestStore()

    const fn = jest.fn()

    const app = createLocalVue(store, () => {
      const state = useSelector((state: number) => state)

      watchEffect(() => {
        fn(state.value)
      })

      store.dispatch({ type: INCREMENT })

      return { state }
    })

    app.mount(document.createElement('template'))

    expect(fn).toHaveBeenNthCalledWith(1, 0)
    expect(fn).toHaveBeenNthCalledWith(2, 1)
  })
})
