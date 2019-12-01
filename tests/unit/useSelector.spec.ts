import CompositionApi, { Ref, createElement as h } from '@vue/composition-api'
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

    const { useDispatch, useSelector } = VueReduxHooks(localVue, store)

    let child: {
      INCREMENT(): {
        type: string
      }
      state: Ref<number>
    }

    new localVue({
      components: {
        child: {
          setup() {
            const dispatch = useDispatch()

            const state = useSelector(state => state)

            const INCREMENT = () =>
              dispatch({
                type: 'INCREMENT',
              })

            child = { INCREMENT, state }
            return () => h('div')
          },
        },
      },
      setup: () => () => h('child'),
    }).$mount()

    expect(child.state.value).toStrictEqual(0)
    child.INCREMENT()
    expect(child.state.value).toStrictEqual(1)
  })
})
