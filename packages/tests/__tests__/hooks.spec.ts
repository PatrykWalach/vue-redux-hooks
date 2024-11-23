import {
  type EnhancedStore,
  configureStore,
  createSlice,
} from '@reduxjs/toolkit'
import { mount } from 'cypress/vue'
import { defineComponent, h, ref } from 'vue'
import { install, useDispatch, useSelector, useStore } from 'vue-redux-hooks'

export const createCounter = (i: number) =>
  createSlice({
    initialState: 0,
    name: `counter${i}`,
    reducers: { INCREMENT: (state) => state + 1 },
  })

const counter0 = createCounter(0)
const counter1 = createCounter(1)

const store: EnhancedStore<{
  counter0: number
  counter1: number
}> = configureStore({
  reducer: {
    counter0: counter0.reducer,
    counter1: counter1.reducer,
  },
})

export type State = ReturnType<typeof store.getState>

const App = defineComponent(() => {
  const index = ref<keyof State>('counter0')

  const state = useSelector((state: State) => state[index.value])
  const dispatch = useDispatch()
  const increment0 = () => dispatch(counter0.actions.INCREMENT())
  const increment1 = () => dispatch(counter1.actions.INCREMENT())

  return () => [
    h(
      'button',
      {
        onClick() {
          index.value = index.value === 'counter0' ? 'counter1' : 'counter0'
        },
        class: 'change',
      },
      'Change counter',
    ),
    h('button', { onClick: increment0, class: 'increment0' }, 'Increment0'),
    h('button', { onClick: increment1, class: 'increment1' }, 'Increment1'),
    h('div', {}, `Current count: ${state.value}`),
  ]
})

describe('hooks', () => {
  it('select and dispatch', () => {
    mount(App, {
      global: {
        plugins: [install(store)],
      },
    })

    cy.get('div').contains('Current count: 0')
    cy.get('.increment0').click()
    cy.get('div').contains('Current count: 1')
    cy.get('.change').click()
    cy.get('div').contains('Current count: 0')
    cy.get('.increment1').click()
    cy.get('.increment1').click()
    cy.get('div').contains('Current count: 2')
  })

  it('useStore throws if store not provided', () => {
    expect(() => {
      useStore()
    }).to.throw()
  })
})
