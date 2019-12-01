import CompositionApi, { createElement as h } from '@vue/composition-api'
import VueReduxHooks from '../../src'
import { createLocalVue } from '@vue/test-utils'
import { createReducer } from '@reduxjs/toolkit'
import { createStore } from 'redux'

describe('useDispatch()', () => {
  it('can dispatch an action', () => {
    const localVue = createLocalVue()

    localVue.use(CompositionApi)
    const store = createStore(
      createReducer(0, {
        INCREMENT: state => state + 1,
      }),
    )

    const { useDispatch } = VueReduxHooks(localVue, store)

    let child: {
      INCREMENT(): {
        type: string
      }
    }

    new localVue({
      components: {
        child: {
          setup() {
            const dispatch = useDispatch()

            const INCREMENT = () =>
              dispatch({
                type: 'INCREMENT',
              })

            child = { INCREMENT }
            return () => h('div')
          },
        },
      },
      setup: () => () => h('child'),
    }).$mount()

    expect(store.getState()).toStrictEqual(0)
    child.INCREMENT()
    expect(store.getState()).toStrictEqual(1)
  })
})
