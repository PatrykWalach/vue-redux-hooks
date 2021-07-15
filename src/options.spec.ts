import { mount } from '@cypress/vue'
import { configureStore, createSlice, EnhancedStore } from '@reduxjs/toolkit'
import { defineComponent, h } from 'vue-demi'
import { install, mapDispatch, mapState } from './'

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
  data() {
    const index: keyof State = 'counter0'
    return { index }
  },
  computed: {
    ...mapState({
      state(state: State) {
        return state[this.index as keyof State]
      },
    }),
  },
  methods: {
    ...mapDispatch({
      increment0: (dispatch: Dispatch) =>
        dispatch(counter0.actions.INCREMENT()),
      increment1: (dispatch: Dispatch) =>
        dispatch(counter1.actions.INCREMENT()),
    }),
  },

  render() {
    return [
      h(
        'button',
        {
          onClick: () => {
            this.index = this.index === 'counter0' ? 'counter1' : 'counter0'
          },
          class: 'change',
        },
        'Change counter',
      ),
      h(
        'button',
        { onClick: this.increment0, class: 'increment0' },
        'Increment0',
      ),
      h(
        'button',
        { onClick: this.increment1, class: 'increment1' },
        'Increment1',
      ),
      h('div', {}, `Current count: ${this.state}`),
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

  //   it('useStore throws if store not provided', () => {
  //     expect(() => {
  //       useStore()
  //     }).to.throw()
  //   })
})
