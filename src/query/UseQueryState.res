@genType
let createUseQueryState = (endpoint, reduxKey, arg, ~skip: option<Vue.option_ref<bool>>=?, ()) => {
  let stableArg = Vue.computed(() =>
    switch skip {
    | Some(skip) if Vue.unref(skip) => Query.Skip(Query.skipToken)
    | _ => Arg(Vue.unref(arg))
    }
  )

  let selector = Vue.computed(() => endpoint->Query.select(stableArg.value))

  let currentState = UseSelector.useSelector(reduxKey)(.state => selector.value(state))

  let data = Vue.ref(currentState.value.data)

  Vue.watch1(
    currentState,
    ( nextState, lastState, _onCleanup) => {
      data.value = nextState.isSuccess
        ? nextState.data
        : Belt.Option.isSome(lastState.data)
        ? lastState.data
        : nextState.data
    },
    (),
  )

  let isFetching = Vue.computed(() => currentState.value.isLoading)

  let isLoading = Vue.computed(() => Belt.Option.isNone(data.value) && isFetching.value)

  let isSuccess = Vue.computed(() =>
    currentState.value.isSuccess || (isFetching.value && Belt.Option.isSome(data.value))
  )

  {
    "isUninitialized": Vue.computed(() => currentState.value.isUninitialized),
    "isError": Vue.computed(() => currentState.value.isError),
    "error": Vue.computed(() => currentState.value.error),
    "status": Vue.computed(() => currentState.value.status),
    "startedTimeStamp": Vue.computed(() => currentState.value.startedTimeStamp),
    "requestId": Vue.computed(() => currentState.value.requestId),
    // "originalArgs": Vue.computed(() => currentState.value.originalArgs),
    "fulfilledTimeStamp": Vue.computed(() => currentState.value.fulfilledTimeStamp),
    "endpointName": Vue.computed(() => currentState.value.endpointName),
    "data": Vue.computed(() => data.value),
    "isFetching": isFetching,
    "isLoading": isLoading,
    "isSuccess": isSuccess,
  }
}
