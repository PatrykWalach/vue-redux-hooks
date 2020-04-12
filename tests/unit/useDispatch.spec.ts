import { createLocalVue, createTestStore, mount } from './utils'
import { useDispatch } from '../../src'

describe('useDispatch()', () => {
  it('can dispatch an action', () => {
    const [store, INCREMENT] = createTestStore()

    expect(store.getState()).toStrictEqual(0)

    const app = createLocalVue(store, () => {
      const dispatch = useDispatch()
      dispatch({ type: INCREMENT })
      return { dispatch }
    })

    mount(app)

    expect(store.getState()).toStrictEqual(1)
  })
})
