import type { SubscriptionOptions } from '@reduxjs/toolkit/dist/query/core/apiState'
import type {
  QueryArgFrom,
  QueryDefinition,
} from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import { UNINITIALIZED_VALUE } from '@reduxjs/toolkit/dist/query/react/constants'
import { skipToken } from '@reduxjs/toolkit/query'
import { computed } from 'vue-demi'
import {
  createUseLazyQuerySubscription,
  UseLazyQueryLastPromiseInfo,
} from './useLazyQuerySubscription'
import {
  createUseQueryState,
  UseQueryStateDefaultResult,
  UseQueryStateOptions,
  UseQueryStateResult,
} from './useQueryState'
import { ReactiveRecord } from './util'

/**
 * A React hook similar to [`useQuery`](#usequery), but with manual control over when the data fetching occurs.
 *
 * This hook includes the functionality of [`useLazyQuerySubscription`](#uselazyquerysubscription).
 *
 * #### Features
 *
 * - Manual control over firing a request to retrieve data
 * - 'Subscribes' the component to keep cached data in the store, and 'unsubscribes' when the component unmounts
 * - Returns the latest request status and cached data from the Redux store
 * - Re-renders as the request status changes and data becomes available
 * - Accepts polling/re-fetching options to trigger automatic re-fetches when the corresponding criteria is met and the fetch has been manually called at least once
 *
 */
export type UseLazyQuery<D extends QueryDefinition<any, any, any, any>> = <
  R = UseQueryStateDefaultResult<D>,
>(
  options?: ReactiveRecord<
    SubscriptionOptions & Omit<UseQueryStateOptions<D, R>, 'skip'>
  >,
) => [
  (arg: QueryArgFrom<D>) => void,
  UseQueryStateResult<D, R>,
  UseLazyQueryLastPromiseInfo<D>,
]

export const createUseLazyQuery = <
  D extends QueryDefinition<any, any, any, any>,
>(
  endpoint: any,
): UseLazyQuery<D> => {
  const useLazyQuerySubscription = createUseLazyQuerySubscription<D>(endpoint)
  const useQueryState = createUseQueryState<D>(endpoint)

  return (options) => {
    const [trigger, arg] = useLazyQuerySubscription(options)

    const queryStateResults = useQueryState(
      computed(() =>
        arg.value === UNINITIALIZED_VALUE ? skipToken : arg.value,
      ),
      {
        ...options,
        skip: computed(() => arg.value === UNINITIALIZED_VALUE),
      },
    )

    return [trigger, queryStateResults, { lastArg: arg }] as any
  }
}
