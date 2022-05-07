// import type { SubscriptionOptions } from '@reduxjs/toolkit/dist/query/core/apiState'
// import type { QueryActionCreatorResult } from '@reduxjs/toolkit/dist/query/core/buildInitiate'
// import type {
//   QueryArgFrom,
//   QueryDefinition,
// } from '@reduxjs/toolkit/dist/query/endpointDefinitions'
// import { skipToken, SkipToken } from '@reduxjs/toolkit/query'
// import {
//   computed,
//   shallowRef,
//   ToRefs,
//   unref,
//   watch,
//   watchEffect,
// } from 'vue-demi'
// import { useDispatch } from '../hooks/useDispatch'
// import { Reactive, ReactiveRecord } from './util'

//  interface UseQuerySubscriptionOptions extends SubscriptionOptions {
//   /**
//    * Prevents a query from automatically running.
//    *
//    * @remarks
//    * When `skip` is true (or `skipToken` is passed in as `arg`):
//    *
//    * - **If the query has cached data:**
//    *   * The cached data **will not be used** on the initial load, and will ignore updates from any identical query until the `skip` condition is removed
//    *   * The query will have a status of `uninitialized`
//    *   * If `skip: false` is set after skipping the initial load, the cached result will be used
//    * - **If the query does not have cached data:**
//    *   * The query will have a status of `uninitialized`
//    *   * The query will not exist in the state when viewed with the dev tools
//    *   * The query will not automatically fetch on mount
//    *   * The query will not automatically run when additional components with the same query are added that do run
//    *
//    * @example
//    * ```tsx
//    * // codeblock-meta title="Skip example"
//    * let Pokemon = ({ name, skip }: { name: string; skip: boolean }) => {
//    *   let { data, error, status } = useGetPokemonByNameQuery(name, {
//    *     skip,
//    *   });
//    *
//    *   return (
//    *     <div>
//    *       {name} - {status}
//    *     </div>
//    *   );
//    * };
//    * ```
//    */
//   skip?: boolean
//   /**
//    * Defaults to `false`. This setting allows you to control whether if a cached result is already available, RTK Query will only serve a cached result, or if it should `refetch` when set to `true` or if an adequate amount of time has passed since the last successful query result.
//    * - `false` - Will not cause a query to be performed _unless_ it does not exist yet.
//    * - `true` - Will always refetch when a new subscriber to a query is added. Behaves the same as calling the `refetch` callback or passing `forceRefetch: true` in the action creator.
//    * - `number` - **Value is in seconds**. If a number is provided and there is an existing query in the cache, it will compare the current time vs the last fulfilled timestamp, and only refetch if enough time has elapsed.
//    *
//    * If you specify this option alongside `skip: true`, this **will not be evaluated** until `skip` is false.
//    */
//   refetchOnMountOrArgChange?: boolean | number
// }

//  type UseQuerySubscription<
//   D extends QueryDefinition<any, any, any, any>,
// > = (
//   arg: Reactive<QueryArgFrom<D> | SkipToken>,
//   options?: ReactiveRecord<UseQuerySubscriptionOptions>,
// ) => Pick<QueryActionCreatorResult<D>, 'refetch'>
@genType
let createUseQuerySubscription = (
  endpoint,
  reduxKey,
  arg,
  ~skip=?,
  ~pollingInterval=?,
  ~refetchOnMountOrArgChange=?,
  ~refetchOnReconnect=?,
  ~refetchOnFocus=?,
  (),
) => {
  let stableArg = Vue.computed(() =>
    switch skip {
    | Some(skip) if Vue.unref(skip) => Query.Skip(Query.skipToken)
    | _ => Arg(Vue.unref(arg))
    }
  )

  let stableSubscriptionOptions = Vue.computed(() => {
    Query.refetchOnReconnect: refetchOnReconnect->Belt.Option.map(Vue.unref),
    refetchOnFocus: refetchOnFocus->Belt.Option.map(Vue.unref),
    pollingInterval: pollingInterval->Vue.getWithDefault(Some(0)),
  })

  let promiseRef = Vue.shallowRefEmpty()

  let dispatch = UseDispatch.useDispatch(reduxKey)(.)

  Vue.watchEffect(onCleanup => {
    let promise = promiseRef.value
    onCleanup(.() => {
      switch promise {
      | None => ()
      | Some(promise) => promise->Query.unsubscribe
      }
    })
  }, ())

  Vue.watch3(
    (
      stableArg,
      Vue.computed(() => refetchOnMountOrArgChange->Belt.Option.map(Vue.unref)),
      stableSubscriptionOptions,
    ),
    (next, _prev, _onCleanup) => {
      let (stableArg, forceRefetch, subscriptionOptions) = next
      switch (stableArg, promiseRef.value) {
      | (Query.Skip(_), _) => promiseRef.value = None

      | (Arg(stableArg), Some(promise)) if promise.arg == stableArg =>
        if subscriptionOptions != promise.subscriptionOptions {
          promise->Query.updateSubscriptionOptions(subscriptionOptions)
        }

      | (Arg(stableArg), _) =>
        promiseRef.value = dispatch(
          endpoint->Query.initiate(
            stableArg,
            ~options=Query.initiateOptions(~subscriptionOptions, ~forceRefetch?, ()),
            (),
          ),
        )
      }
    },
    ~options={Vue.immediate: true},
    (),
  )

  let refetch = () => {
    switch promiseRef.value {
    | Some(value) => value->Query.refetch
    | None => ()
    }
  }

  {
    "refetch": refetch,
  }
}
