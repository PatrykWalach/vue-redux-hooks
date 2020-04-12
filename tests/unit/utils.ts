import { AnyAction, Store, createStore } from 'redux'
import { createApp, h, App } from 'vue'
import { ReduxStore } from '../../src'
type Setup = () => any

export const createTestStore = (): [Store<number, AnyAction>, string] => {
  const INCREMENT = 'INCREMENT'
  const reducer = (state = 0, { type }: AnyAction) => {
    switch (type) {
      case INCREMENT:
        return state + 1
      default:
        return state
    }
  }
  const store = createStore(reducer)

  return [store, INCREMENT]
}
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
