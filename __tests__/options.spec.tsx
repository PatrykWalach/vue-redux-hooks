import {
  type EnhancedStore,
  configureStore,
  createSlice,
} from '@reduxjs/toolkit'
import { mount } from 'cypress/vue'
import { defineComponent } from 'vue-demi'
import { install, mapDispatch, mapState } from '../src'

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
export type Dispatch = typeof store.dispatch

const App = defineComponent({
  data(): { index: keyof State } {
    const index = 'counter0'
    return { index }
  },
  computed: {
    ...mapState<{ index: keyof State }, State>()({
      state(state) {
        return state[this.index]
      },
    }),
  },
  methods: {
    ...mapDispatch()({
      increment0: counter0.actions.INCREMENT,
      increment1: counter1.actions.INCREMENT,
    }),
  },

  render() {
    return [
      <button
        class="change"
        onClick={() => {
          this.index = this.index === 'counter0' ? 'counter1' : 'counter0'
        }}
      >
        Change counter
      </button>,
      <button class="increment0" onClick={this.increment0}>
        Increment 0
      </button>,
      <button class="increment1" onClick={this.increment1}>
        Increment 1
      </button>,
      <div>Current count: {this.state}</div>,
    ]
  },
})

describe('hooks', () => {
  it('map state and dispatch', () => {
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

  it('mapDispatch type error', () => {
    expect(() => {
      mapDispatch()({
        // @ts-expect-error - wrong arg type
        a: 1,
      })
    }).to.throw()
  })
})
