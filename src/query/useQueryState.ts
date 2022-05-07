import { SerializedError } from '@reduxjs/toolkit'
import { BaseQueryError } from '@reduxjs/toolkit/dist/query/baseQueryTypes'
import { ApiEndpointQuery } from '@reduxjs/toolkit/dist/query/core/module'
import type {
  EndpointDefinitions,
  QueryArgFrom,
  QueryDefinition,
  ResultTypeFrom,
} from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import { QueryStatus, SkipToken, skipToken } from '@reduxjs/toolkit/query'
import { computed, ComputedRef, unref } from 'vue-demi'
import { useSelector } from '../hooks/useSelector'
import { Reactive, ReactiveRecord } from './util'

export type AnyQueryDef = QueryDefinition<any, any, any, any>

export type QueryError<D> =
  | SerializedError
  | (D extends QueryDefinition<any, infer BaseQuery, any, any>
      ? BaseQueryError<BaseQuery>
      : never)

export type UseQueryStateResult<D extends AnyQueryDef> = {
  readonly isUninitialized: ComputedRef<boolean>
  readonly isLoading: ComputedRef<boolean>
  readonly isSuccess: ComputedRef<boolean>
  readonly isError: ComputedRef<boolean>
  readonly data: ComputedRef<ResultTypeFrom<D> | null | undefined>
  readonly error: ComputedRef<QueryError<D> | null | undefined>
  readonly status: ComputedRef<QueryStatus>
  readonly startedTimeStamp: ComputedRef<number | null | undefined>
  readonly requestId: ComputedRef<string | null | undefined>
  readonly originalArgs: ComputedRef<QueryArgFrom<D> | null | undefined>
  readonly fulfilledTimeStamp: ComputedRef<number | null | undefined>
  readonly endpointName: ComputedRef<string | null | undefined>
}

export type UseQueryStateOptions<D extends AnyQueryDef> = {
  readonly skip?: boolean
}

export type UseQueryState<D extends AnyQueryDef> = (
  arg: Reactive<QueryArgFrom<D> | SkipToken>,
  options?: ReactiveRecord<UseQueryStateOptions<D>>,
) => UseQueryStateResult<D>

export const createUseQueryState =
  <D extends AnyQueryDef>(
    endpoint: ApiEndpointQuery<D, EndpointDefinitions>,
  ): UseQueryState<D> =>
  (arg, { skip = false } = {}) => {
    const stableArg = computed(() => (unref(skip) ? skipToken : unref(arg)))

    const selector = computed(() => endpoint.select(stableArg.value))

    const result = useSelector(selector)

    return {
      isUninitialized: computed(() => result.value.isUninitialized),
      isLoading: computed(() => result.value.isLoading),
      isSuccess: computed(() => result.value.isSuccess),
      isError: computed(() => result.value.isError),
      data: computed(() => result.value.data),
      error: computed(() => result.value.error),
      status: computed(() => result.value.status),
      startedTimeStamp: computed(() => result.value.startedTimeStamp),
      requestId: computed(() => result.value.requestId),
      originalArgs: computed(() => result.value.originalArgs),
      fulfilledTimeStamp: computed(() => result.value.fulfilledTimeStamp),
      endpointName: computed(() => result.value.endpointName),
    }
  }
