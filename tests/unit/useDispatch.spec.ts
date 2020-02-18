import { AnyAction, Dispatch, createStore } from 'redux'
import CompositionApi, { createElement as h } from '@vue/composition-api'
import VueReduxHooks, { useDispatch } from '../../src'
import { createLocalVue } from '@vue/test-utils'
import { createReducer } from '@reduxjs/toolkit'

describe('useDispatch()', () => {
  it('can dispatch an action', () => {
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

            return { dispatch }
          },
        },
      },
      setup: () => () => h('child'),
    }).$mount()

    const [child] = (vm.$children as unknown) as {
      dispatch: Dispatch<AnyAction>
    }[]

    expect(store.getState()).toStrictEqual(0)
    child.dispatch({
      type: 'INCREMENT',
    })
    expect(store.getState()).toStrictEqual(1)
  })
})
