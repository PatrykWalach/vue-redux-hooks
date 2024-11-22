export const DefaultReduxContext: InjectionKey<
  ReduxContext<GetState, GetAction>
> = Symbol('redux-context')

import type { Action, AnyAction, Store } from 'redux'
import {
  type App,
  type InjectionKey,
  type Ref,
  computed,
  markRaw,
  reactive,
  shallowRef,
} from 'vue-demi'
import type { GetAction } from './hooks/useDispatch'
import type { GetState } from './hooks/useSelector'

export type ReduxContext<S, A extends Action> = {
  store: Store<S, A>
  state: Ref<S>
}

export const install =
  <S, A extends Action = AnyAction>(
    store: Store<S, A>,
    injectionKey: InjectionKey<ReduxContext<S, A>> = DefaultReduxContext,
  ) =>
  (app: App) => {
    const { subscribe, getState } = store

    const state = shallowRef(getState())

    subscribe(() => {
      state.value = getState()
    })

    const readonlyState = computed(() => state.value)

    app.config.globalProperties.$redux = reactive({
      store: markRaw(store),
      state: readonlyState,
    })

    app.provide(injectionKey, { store, state: readonlyState })
  }
