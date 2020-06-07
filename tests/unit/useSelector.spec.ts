import { AnyAction, Dispatch, createStore } from 'redux'
import CompositionApi, { createElement as h } from '@vue/composition-api'
import { Slice, createSlice } from '@reduxjs/toolkit'
import VueReduxHooks, { useDispatch, useSelector } from '../../src'
import { VueConstructor } from 'vue'
import { createLocalVue } from '@vue/test-utils'
import { mount } from './util'

describe('useSelector()', () => {
  let counter: Slice<
    number,
    {
      INCREMENT: (state: number) => number
    }
  >
  let localVue: VueConstructor<Vue>

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(CompositionApi)

    counter = createSlice({
      initialState: 0,
      name: 'counter',
      reducers: { INCREMENT: state => state + 1 },
    })
  })

  it('is reactive', () => {
    const store = createStore(counter.reducer)

    localVue.use(VueReduxHooks, store)

    const vm = mount(
      localVue,
      () => {
        const dispatch = useDispatch()
        const state = useSelector(state => state)

        return { dispatch, state }
      },
      () => h('div'),
    )

    const [child] = (vm.$children as unknown) as {
      dispatch: Dispatch<AnyAction>
      state: number
    }[]

    expect(child.state).toStrictEqual(0)
    child.dispatch(counter.actions.INCREMENT())
    expect(child.state).toStrictEqual(1)
  })

  it('can be typed', () => {
    const store = createStore(counter.reducer)

    localVue.use(VueReduxHooks, store)

    type State = ReturnType<typeof store.getState>

    expect(() =>
      mount(localVue, () => {
        const state = useSelector((state: State) => state)

        1 + state.value

        return () => null
      }),
    ).not.toThrow()
  })
})
