import type { AnyAction, ThunkDispatch } from '@reduxjs/toolkit'
import type { SubscriptionOptions } from '@reduxjs/toolkit/dist/query/core/apiState'
import type { QueryActionCreatorResult } from '@reduxjs/toolkit/dist/query/core/buildInitiate'
import type { ApiEndpointQuery } from '@reduxjs/toolkit/dist/query/core/module'
import type {
  EndpointDefinitions,
  QueryArgFrom,
} from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import { type SkipToken, skipToken } from '@reduxjs/toolkit/query'
import { computed, onBeforeUnmount, shallowRef, unref, watch } from 'vue-demi'
import { useDispatch } from '../hooks/useDispatch'
import type { AnyQueryDef } from './useQueryState'
import type { Reactive, ReactiveRecord } from './util'

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
  readonly skip?: boolean
  /**
   * Defaults to `false`. This setting allows you to control whether if a cached result is already available, RTK Query will only serve a cached result, or if it should `refetch` when set to `true` or if an adequate amount of time has passed since the last successful query result.
   * - `false` - Will not cause a query to be performed _unless_ it does not exist yet.
   * - `true` - Will always refetch when a new subscriber to a query is added. Behaves the same as calling the `refetch` callback or passing `forceRefetch: true` in the action creator.
   * - `number` - **Value is in seconds**. If a number is provided and there is an existing query in the cache, it will compare the current time vs the last fulfilled timestamp, and only refetch if enough time has elapsed.
   *
   * If you specify this option alongside `skip: true`, this **will not be evaluated** until `skip` is false.
   */
  readonly refetchOnMountOrArgChange?: boolean | number
}

export type UseQuerySubscriptionResult<D extends AnyQueryDef> = {
  readonly refetch: () => void
}

export type UseQuerySubscription<D extends AnyQueryDef> = (
  arg: Reactive<QueryArgFrom<D> | SkipToken>,
  options?: ReactiveRecord<UseQuerySubscriptionOptions>,
) => UseQuerySubscriptionResult<D>

export const createUseQuerySubscription =
  <D extends AnyQueryDef>(
    endpoint: ApiEndpointQuery<D, EndpointDefinitions>,
  ): UseQuerySubscription<D> =>
  (
    arg,
    {
      skip = false,
      pollingInterval = 0,
      refetchOnMountOrArgChange,
      ...options
    } = {},
  ) => {
    const stableArg = computed(() => (unref(skip) ? skipToken : unref(arg)))

    const stableSubscriptionOptions = computed(() => ({
      refetchOnReconnect: unref(options.refetchOnReconnect),
      refetchOnFocus: unref(options.refetchOnFocus),
      pollingInterval: unref(pollingInterval),
    }))

    const promiseRef = shallowRef<undefined | QueryActionCreatorResult<D>>(
      undefined,
    )

    const dispatch = useDispatch<ThunkDispatch<any, any, AnyAction>>()

    watch(
      [
        stableArg,
        computed(() => unref(refetchOnMountOrArgChange)),
        stableSubscriptionOptions,
      ],
      ([stableArg, forceRefetch, subscriptionOptions], _, onCleanup) => {
        const lastPromise = promiseRef.value
        if (stableArg === skipToken) {
          lastPromise?.unsubscribe()
          promiseRef.value = undefined
          return
        }

        const lastSubscriptionOptions = lastPromise?.subscriptionOptions
        if (!lastPromise || lastPromise.arg !== stableArg) {
          lastPromise?.unsubscribe()
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
      promiseRef.value?.unsubscribe()
    })

    return {
      refetch() {
        promiseRef.value?.refetch()
      },
    }
  }
