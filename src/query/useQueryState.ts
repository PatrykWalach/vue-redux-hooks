import type { ApiEndpointQuery } from '@reduxjs/toolkit/dist/query/core/module'
import type { EndpointDefinitions } from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import { skipToken } from '@reduxjs/toolkit/query'
import { computed, ref, unref, watch } from 'vue-demi'
import { useSelector } from '../hooks/useSelector'
import type { AnyQueryDef, UseQueryState } from './types'

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
