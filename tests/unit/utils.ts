import { createApp, defineComponent, h, provide } from 'vue'
import { ReduxStore } from '../../src'
import { Store } from 'redux'
type Setup = () => any
export const createRootComponent = (store: Store<any, any>, setup: Setup) =>
  defineComponent({
    setup: () => {
      provide(ReduxStore, store)
      return () => h(createChild(setup))
    },
  })

export const createLocalVue = (store: Store<any, any>, setup: Setup) => {
  const rootComponent = createRootComponent(store, setup)
  return createApp(rootComponent)
}

export const createChild = (setup: Setup) =>
  defineComponent({
    render: () => h('div'),
    setup,
  })
