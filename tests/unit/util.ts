import { VNode, VueConstructor } from 'vue'
import { SetupFunction } from '@vue/composition-api/dist/component'
import { createElement as h } from '@vue/composition-api'

export const mount = (
  localVue: VueConstructor<Vue>,
  setup: SetupFunction<{}, {}>,
  render?: () => VNode,
) =>
  new localVue({
    setup: () => () => h({ render, setup }),
  }).$mount()
