import type { AnyAction, ThunkDispatch } from '@reduxjs/toolkit'
import type { QueryActionCreatorResult } from '@reduxjs/toolkit/dist/query/core/buildInitiate'
import type { ApiEndpointQuery } from '@reduxjs/toolkit/dist/query/core/module'
import type { EndpointDefinitions } from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import { skipToken } from '@reduxjs/toolkit/query'
import { computed, onBeforeUnmount, shallowRef, unref, watch } from 'vue-demi'
import { useDispatch } from '../hooks/useDispatch'
import type { AnyQueryDef, UseQuerySubscription } from './types'

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
      ([stableArg, forceRefetch, subscriptionOptions]) => {
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
