import { AnyAction, Dispatch, createStore } from 'redux'
import CompositionApi, { createElement as h } from '@vue/composition-api'
import VueReduxHooks, { useDispatch, useSelector } from '../../src'
import { createLocalVue } from '@vue/test-utils'
import { createReducer } from '@reduxjs/toolkit'

describe('useSelector()', () => {
  it('is reactive', () => {
    const localVue = createLocalVue()

    localVue.use(CompositionApi)
    const store = createStore(
      createReducer(0, {
        INCREMENT: state => state + 1,
      }),
    )

    localVue.use(VueReduxHooks, store)

    const vm = new localVue({
      components: {
        child: {
          render: () => h('div'),
          setup() {
            const dispatch = useDispatch()
            const state = useSelector(state => state)

            return { dispatch, state }
          },
        },
      },
      setup: () => () => h('child'),
    }).$mount()

    const [child] = (vm.$children as unknown) as {
      dispatch: Dispatch<AnyAction>
      state: number
    }[]

    expect(child.state).toStrictEqual(0)
    child.dispatch({
      type: 'INCREMENT',
    })
    expect(child.state).toStrictEqual(1)
  })
})
