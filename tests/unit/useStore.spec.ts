import CompositionApi, { createElement as h } from '@vue/composition-api'
import VueReduxHooks, { useStore } from '../../src'
import { createLocalVue } from '@vue/test-utils'
import {
  Slice,
  configureStore,
  createReducer,
  createSlice,
} from '@reduxjs/toolkit'
import { createStore } from 'redux'
import { VueConstructor } from 'vue'
import { mount } from './util'

describe('useStore()', () => {
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

  it('returns store', () => {
    const store = createStore(counter.reducer)

    localVue.use(VueReduxHooks, store)

    const vm = mount(
      localVue,

      () => {
        const injectedStore = useStore()

        return { injectedStore }
      },
      () => h('div'),
    )

    const [child] = (vm.$children as unknown) as {
      injectedStore: typeof store
    }[]

    expect(child.injectedStore).toStrictEqual(store)
  })

  it('can by typed', () => {
    const store = configureStore({ reducer: counter.reducer })
    type Store = typeof store
    localVue.use(VueReduxHooks, store)

    expect(() =>
      mount(
        localVue,
        () => {
          const injectedStore = useStore<Store>()

          injectedStore.dispatch(dispatch => {
            dispatch(counter.actions.INCREMENT())
          })

          return { injectedStore }
        },
        () => h('div'),
      ),
    ).not.toThrow()
  })
})
