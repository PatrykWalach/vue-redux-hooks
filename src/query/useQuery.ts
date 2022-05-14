import { ApiEndpointQuery } from '@reduxjs/toolkit/dist/query/core/module'
import type {
  EndpointDefinitions,
  QueryArgFrom,
} from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import { SkipToken } from '@reduxjs/toolkit/query'
import {
  AnyQueryDef,
  createUseQueryState,
  UseQueryStateOptions,
  UseQueryStateResult,
} from './useQueryState'
import {
  createUseQuerySubscription,
  UseQuerySubscriptionOptions,
  UseQuerySubscriptionResult,
} from './useQuerySubscription'
import { Reactive, ReactiveRecord } from './util'

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
