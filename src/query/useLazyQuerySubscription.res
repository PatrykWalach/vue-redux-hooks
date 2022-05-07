type uninitialized<'a> = Args('a) | UninitializedValue

@genType
let createUseLazyQuerySubscription = (
  endpoint,
  reduxKey,
  ~refetchOnReconnect,
  ~refetchOnFocus,
  ~pollingInterval,
  (),
) => {
  let dispatch = UseDispatch.useDispatch(reduxKey)(.)

  let arg = Vue.ref(UninitializedValue)

  let promiseRef = Vue.refEmpty()

  let stableSubscriptionOptions = Vue.computed(() => {
    Query.refetchOnReconnect: refetchOnReconnect->Belt.Option.map(Vue.unref),
    refetchOnFocus: refetchOnFocus->Belt.Option.map(Vue.unref),
    pollingInterval: pollingInterval->Vue.getWithDefault(Some(0)),
  })

  Vue.watchEffect(onCleanup => {
    let promise = promiseRef.value
    onCleanup(.() => {
      switch promise {
      | Some(value) => value->Query.unsubscribe
      | None => ()
      }
    })
  }, ())

  Vue.watchEffect(_onCleanup => {
    switch promiseRef.value {
    | Some(promise) if stableSubscriptionOptions.value != promise.subscriptionOptions =>
      promise->Query.updateSubscriptionOptions(stableSubscriptionOptions.value)
    | None
    | Some(_) => ()
    }
  }, ())

  let trigger = (nextArg, ~preferCacheValue=false, ()) => {
    promiseRef.value = dispatch(
      endpoint->Query.initiate(
        nextArg,
        ~options=Query.initiateOptions(
          ~subscriptionOptions=stableSubscriptionOptions.value,
          ~forceRefetch=!preferCacheValue,
          (),
        ),
        (),
      ),
    )
    arg.value = Args(nextArg)
  }

  Vue.watchEffect(_onCleanup => {
    switch (arg.value, promiseRef.value) {
    | (Args(arg), None) => trigger(arg, ~preferCacheValue=true, ())
    | _ => ()
    }
  }, ())

  (trigger, arg)
}
