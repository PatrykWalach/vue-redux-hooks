import { Store } from 'redux'
import { createApp, h, App } from 'vue'
import { ReduxStore } from '../../src'
import { createSlice } from '@reduxjs/toolkit'
type Setup = () => any

export const createLocalVue = (store: Store<any, any>, setup: Setup) => {
  const rootComponent = createRootComponent(setup)
  const app = createApp(rootComponent).provide(ReduxStore, store)

  return app
}

export const createRootComponent = (setup: Setup) => ({
  render: () => h('div'),
  setup,
})

export const mount = (app: App<Element>) =>
  app.mount(document.createElement('template'))

export const createCounter = () =>
  createSlice({
    initialState: 0,
    name: 'counter',
    reducers: { INCREMENT: (state) => state + 1 },
  })

export type Counter = ReturnType<typeof createCounter>
