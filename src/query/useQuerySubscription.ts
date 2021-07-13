import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit'
import type { SubscriptionOptions } from '@reduxjs/toolkit/dist/query/core/apiState'
import type { QueryActionCreatorResult } from '@reduxjs/toolkit/dist/query/core/buildInitiate'
import type {
  QueryArgFrom,
  QueryDefinition,
} from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import { skipToken, SkipToken } from '@reduxjs/toolkit/query'
import { onBeforeUnmount, reactive, shallowRef, toRef } from 'vue-demi'
import { computed, watch } from 'vue-demi'
import { useDispatch } from '../hooks/useDispatch'
import { Reactive, ReactiveRecord } from './util'

export interface UseQuerySubscriptionOptions extends SubscriptionOptions {
  /**
   * Prevents a query from automatically running.
   *
   * @remarks
   * When `skip` is true (or `skipToken` is passed in as `arg`):
   *
   * - **If the query has cached data:**
   *   * The cached data **will not be used** on the initial load, and will ignore updates from any identical query until the `skip` condition is removed
   *   * The query will have a status of `uninitialized`
   *   * If `skip: false` is set after skipping the initial load, the cached result will be used
   * - **If the query does not have cached data:**
   *   * The query will have a status of `uninitialized`
   *   * The query will not exist in the state when viewed with the dev tools
   *   * The query will not automatically fetch on mount
   *   * The query will not automatically run when additional components with the same query are added that do run
   *
   * @example
   * ```tsx
   * // codeblock-meta title="Skip example"
   * const Pokemon = ({ name, skip }: { name: string; skip: boolean }) => {
   *   const { data, error, status } = useGetPokemonByNameQuery(name, {
   *     skip,
   *   });
   *
   *   return (
   *     <div>
   *       {name} - {status}
   *     </div>
   *   );
   * };
   * ```
   */
  skip?: boolean
  /**
   * Defaults to `false`. This setting allows you to control whether if a cached result is already available, RTK Query will only serve a cached result, or if it should `refetch` when set to `true` or if an adequate amount of time has passed since the last successful query result.
   * - `false` - Will not cause a query to be performed _unless_ it does not exist yet.
   * - `true` - Will always refetch when a new subscriber to a query is added. Behaves the same as calling the `refetch` callback or passing `forceRefetch: true` in the action creator.
   * - `number` - **Value is in seconds**. If a number is provided and there is an existing query in the cache, it will compare the current time vs the last fulfilled timestamp, and only refetch if enough time has elapsed.
   *
   * If you specify this option alongside `skip: true`, this **will not be evaluated** until `skip` is false.
   */
  refetchOnMountOrArgChange?: boolean | number
}

export type UseQuerySubscription<
  D extends QueryDefinition<any, any, any, any>,
> = (
  arg: Reactive<QueryArgFrom<D> | SkipToken>,
  options?: ReactiveRecord<UseQuerySubscriptionOptions>,
) => Pick<QueryActionCreatorResult<D>, 'refetch'>

export const createUseQuerySubscription =
  <D extends QueryDefinition<any, any, any, any>>(
    endpoint: any,
  ): UseQuerySubscription<D> =>
  (arg, { skip = false, pollingInterval = 0, ...otherOptions } = {}) => {
    const options = reactive({
      skip,
      arg,
      pollingInterval,
      ...otherOptions,
    })

    const stableArg = computed(() => (options.skip ? skipToken : options.arg))

    const refetchOnMountOrArgChange = toRef(
      options,
      'refetchOnMountOrArgChange',
    )

    const stableSubscriptionOptions = computed(() => ({
      refetchOnReconnect: options.refetchOnReconnect,
      refetchOnFocus: options.refetchOnFocus,
      pollingInterval: options.pollingInterval,
    }))

    const promiseRef = shallowRef<undefined | QueryActionCreatorResult<D>>(
      undefined,
    )

    const dispatch = useDispatch<ThunkDispatch<any, any, AnyAction>>()

    watch(
      [stableArg, refetchOnMountOrArgChange, stableSubscriptionOptions],
      ([stableArg, forceRefetch, subscriptionOptions], _, onCleanup) => {
        const lastPromise = promiseRef.value
        if (stableArg === skipToken) {
          lastPromise && lastPromise.unsubscribe()
          promiseRef.value = undefined
          return
        }

        const lastSubscriptionOptions =
          lastPromise && lastPromise.subscriptionOptions
        if (!lastPromise || lastPromise.arg !== stableArg) {
          lastPromise && lastPromise.unsubscribe()
          const promise = dispatch(
            endpoint.initiate(stableArg, {
              subscriptionOptions,
              forceRefetch,
            }),
          )
          promiseRef.value = promise
          return
        }

        if (stableSubscriptionOptions !== lastSubscriptionOptions) {
          lastPromise.updateSubscriptionOptions(subscriptionOptions)
        }
      },
      { immediate: true },
    )

    onBeforeUnmount(() => {
      promiseRef.value && promiseRef.value.unsubscribe()
    })

    return {
      refetch() {
        promiseRef.value && promiseRef.value.refetch()
      },
    }
  }
