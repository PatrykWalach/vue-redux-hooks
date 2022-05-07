@genType
let createUseMutation = (. endpoint, reduxKey, . ()) => {
  open Vue

  let dispatch = UseDispatch.useDispatch(reduxKey)(.)

  let promiseRef = shallowRefEmpty()

  watchEffect(onCleanup => {
    let promise = promiseRef.value

    onCleanup(.() => {
      switch promise {
      | None => ()
      | Some(promise) => promise->Query.unsubscribe
      }
    })
  }, ())

  let triggerMutation = arg => {
    let promise = dispatch(. endpoint->Query.initiate(arg))
    promiseRef.value = promise
    promise
  }

  let requestId = computed(() => promiseRef.value->Belt.Option.map(promise => promise.requestId))

  let mutationSelector = computed(() =>
    endpoint->Query.select(
      switch requestId.value {
      | Some(requestId) => Arg(requestId)
      | None => Query.Skip(Query.skipToken)
      },
    )
  )

  let currentState = UseSelector.useSelector(reduxKey)(.state => mutationSelector.value(state))

  (
    triggerMutation,
    {
      "data": computed(() => currentState.value.data),
      "originalArgs": computed(() =>
        promiseRef.value->Belt.Option.map(Query.arg)->Belt.Option.map(Query.originalArgs)
      ),
      "error": computed(() => currentState.value.error),
      "endpointName": computed(() => currentState.value.endpointName),
      "fulfilledTimeStamp": computed(() => currentState.value.fulfilledTimeStamp),
      "isUninitialized": computed(() => currentState.value.isUninitialized),
      "isLoading": computed(() => currentState.value.isLoading),
      "isSuccess": computed(() => currentState.value.isSuccess),
      "isError": computed(() => currentState.value.isError),
      "startedTimeStamp": computed(() => currentState.value.startedTimeStamp),
    },
  )
}
