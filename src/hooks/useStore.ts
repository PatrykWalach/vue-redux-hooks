import { Store } from 'redux'
import { inject } from '@vue/composition-api'
import { key } from '../install'

export const useStore = <S extends Store = Store>() => {
  const store = inject<S>(key)
  assert(
    store,
    'Warning: no redux store was provided.\n\nPlease provide store preferably with vue install\n\napp.use(VueReduxHooks, store)\n\nLearn more about vue-redux-hooks: https://github.com/PatrykWalach/vue-redux-hooks',
  )
  return store
}

function assert(condition: any, message: string): asserts condition {
  if (!condition) {
    console.error(message)
  }
}
