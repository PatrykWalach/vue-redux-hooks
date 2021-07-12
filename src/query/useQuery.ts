import type {
  QueryArgFrom,
  QueryDefinition,
} from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import { SkipToken } from '@reduxjs/toolkit/query'
import { reactive, toRefs } from 'vue'
import {
  createUseQueryState,
  UseQueryStateDefaultResult,
  UseQueryStateOptions,
  UseQueryStateResult,
} from './useQueryState'
import {
  createUseQuerySubscription,
  UseQuerySubscription,
  UseQuerySubscriptionOptions,
} from './useQuerySubscription'
import { Reactive, ReactiveRecord } from './util'

export type UseQuery<D extends QueryDefinition<any, any, any, any>> = <
  R extends Record<string, any> = UseQueryStateDefaultResult<D>,
>(
  arg: Reactive<QueryArgFrom<D> | SkipToken>,
  options?: ReactiveRecord<
    UseQuerySubscriptionOptions & UseQueryStateOptions<D, R>
  >,
) => UseQueryStateResult<D, R> & ReturnType<UseQuerySubscription<D>>

export const createUseQuery = <D extends QueryDefinition<any, any, any, any>>(
  endpoint: any,
): UseQuery<D> => {
  const useQueryState = createUseQueryState(endpoint)
  const useQuerySubscription = createUseQuerySubscription(endpoint)

  return (arg, options) => {
    return reactive({
      ...toRefs(useQueryState(arg, options)),
      ...useQuerySubscription(arg, options),
    }) as any
  }
}
