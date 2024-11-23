import type { SerializedError } from '@reduxjs/toolkit'
import type { BaseQueryError } from '@reduxjs/toolkit/dist/query/baseQueryTypes'
import type { ApiEndpointQuery } from '@reduxjs/toolkit/dist/query/core/module'
import type {
  EndpointDefinitions,
  QueryArgFrom,
  QueryDefinition,
  ResultTypeFrom,
} from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import {
  type QueryStatus,
  type SkipToken,
  skipToken,
} from '@reduxjs/toolkit/query'
import { type ComputedRef, computed, ref, unref, watch } from 'vue-demi'
import { useSelector } from '../hooks/useSelector'
import type { Reactive, ReactiveRecord } from './util'

export type AnyQueryDef = QueryDefinition<any, any, any, any>

export type QueryError<D> =
  | SerializedError
  | (D extends QueryDefinition<any, infer BaseQuery, any, any>
      ? BaseQueryError<BaseQuery>
      : never)

export type UseQueryStateResult<D extends AnyQueryDef> = {
  readonly isUninitialized: ComputedRef<boolean>
  readonly isLoading: ComputedRef<boolean>
  readonly isFetching: ComputedRef<boolean>
  readonly isSuccess: ComputedRef<boolean>
  readonly isError: ComputedRef<boolean>
  readonly data: ComputedRef<ResultTypeFrom<D> | null | undefined>
  readonly currentData: ComputedRef<ResultTypeFrom<D> | null | undefined>
  readonly error: ComputedRef<QueryError<D> | null | undefined>
  readonly status: ComputedRef<QueryStatus>
  readonly startedTimeStamp: ComputedRef<number | null | undefined>
  readonly requestId: ComputedRef<string | null | undefined>
  readonly originalArgs: ComputedRef<QueryArgFrom<D> | null | undefined>
  readonly fulfilledTimeStamp: ComputedRef<number | null | undefined>
  readonly endpointName: ComputedRef<string | null | undefined>
}

export type UseQueryStateOptions<_D extends AnyQueryDef> = {
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

    const isFetching = computed(() => result.value.isLoading)
    const data = ref(result.value.data)

    watch(result, (result) => {
      if (result.isSuccess) {
        data.value = result.data
      }
    })

    const hasData = computed(() => data.value !== undefined)

    return {
      data: computed(() => data.value),
      currentData: computed(() => result.value.data),
      isLoading: computed(() => !hasData.value && isFetching.value),
      isFetching: isFetching,
      isSuccess: computed(
        () => result.value.isSuccess || (isFetching.value && hasData.value),
      ),
      isUninitialized: computed(() => result.value.isUninitialized),
      isError: computed(() => result.value.isError),
      error: computed(() => result.value.error),
      status: computed(() => result.value.status),
      startedTimeStamp: computed(() => result.value.startedTimeStamp),
      requestId: computed(() => result.value.requestId),
      originalArgs: computed(() => result.value.originalArgs),
      fulfilledTimeStamp: computed(() => result.value.fulfilledTimeStamp),
      endpointName: computed(() => result.value.endpointName),
    }
  }
