import type { ApiEndpointQuery } from '@reduxjs/toolkit/dist/query/core/module'
import type {
  EndpointDefinitions,
  QueryArgFrom,
} from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import type { SkipToken } from '@reduxjs/toolkit/query'
import {
  type AnyQueryDef,
  type UseQueryStateOptions,
  type UseQueryStateResult,
  createUseQueryState,
} from './useQueryState'
import {
  type UseQuerySubscriptionOptions,
  type UseQuerySubscriptionResult,
  createUseQuerySubscription,
} from './useQuerySubscription'
import type { Reactive, ReactiveRecord } from './util'

export type UseQuery<D extends AnyQueryDef> = (
  arg: Reactive<QueryArgFrom<D> | SkipToken>,
  options?: ReactiveRecord<
    UseQuerySubscriptionOptions & UseQueryStateOptions<D>
  >,
) => UseQueryStateResult<D> & UseQuerySubscriptionResult<D>

export const createUseQuery = <D extends AnyQueryDef>(
  endpoint: ApiEndpointQuery<D, EndpointDefinitions>,
): UseQuery<D> => {
  const useQueryState = createUseQueryState(endpoint)
  const useQuerySubscription = createUseQuerySubscription(endpoint)

  return (arg, options) => {
    return {
      ...useQueryState(arg, options),
      ...useQuerySubscription(arg, options),
    }
  }
}
