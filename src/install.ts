export const DefaultReduxContext: InjectionKey<
  ReduxContext<GetState, GetAction>
> = Symbol('redux-context')

import { Action, AnyAction, Store } from 'redux'
import {
  App,
  computed,
  InjectionKey,
  markRaw,
  reactive,
  Ref,
  shallowRef,
} from 'vue-demi'
import { GetAction } from './hooks/useDispatch'
import { GetState } from './hooks/useSelector'

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
