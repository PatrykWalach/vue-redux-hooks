import { Slice, configureStore, createSlice } from '@reduxjs/toolkit'
import VueReduxHooks, { useDispatch } from '../../src'
import CompositionApi from '@vue/composition-api'
import { VueConstructor } from 'vue'
import { createLocalVue } from '@vue/test-utils'
import { createStore } from 'redux'
import { mount } from './util'

describe('useDispatch()', () => {
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

  it('can dispatch an action', () => {
    const store = createStore(counter.reducer)
    localVue.use(VueReduxHooks, store)

    expect(store.getState()).toStrictEqual(0)

    mount(localVue, () => {
      const dispatch = useDispatch()

      dispatch(counter.actions.INCREMENT())

      return () => null
    })

    expect(store.getState()).toStrictEqual(1)
  })

  it('can by typed', () => {
    const store = configureStore({
      reducer: counter.reducer,
    })
    localVue.use(VueReduxHooks, store)

    type AppDispatch = typeof store.dispatch

    expect(store.getState()).toStrictEqual(0)

    mount(localVue, () => {
      const dispatch = useDispatch<AppDispatch>()

      dispatch(dispatch => dispatch(counter.actions.INCREMENT()))
      return () => null
    })

    expect(store.getState()).toStrictEqual(1)
  })
})
