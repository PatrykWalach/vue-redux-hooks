import type { AnyAction, ThunkDispatch } from '@reduxjs/toolkit'
import type { SubscriptionOptions } from '@reduxjs/toolkit/dist/query/core/apiState'
import type { QueryActionCreatorResult } from '@reduxjs/toolkit/dist/query/core/buildInitiate'
import type { QueryArgFrom } from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import {
  computed,
  ComputedRef,
  ref,
  unref,
  UnwrapRef,
  watchEffect,
} from 'vue-demi'
import { useDispatch } from '../hooks/useDispatch'
import { AnyQueryDef } from './useQueryState'
import { ReactiveRecord } from './util'

export const UNINITIALIZED_VALUE = Symbol('UNINITIALIZED_VALUE')
export type UninitializedValue = typeof UNINITIALIZED_VALUE
/**
 * A Vue hook similar to [`useQuerySubscription`](#usequerysubscription), but with manual control over when the data fetching occurs.
 *
 * Note that this hook does not return a request status or cached data. For that use-case, see [`useLazyQuery`](#uselazyquery).
 *
 * #### Features
 *
 * - Manual control over firing a request to retrieve data
 * - 'Subscribes' the component to keep cached data in the store, and 'unsubscribes' when the component unmounts
 * - Accepts polling/re-fetching options to trigger automatic re-fetches when the corresponding criteria is met and the fetch has been manually called at least once
 */
export type UseLazyQuerySubscription<D extends AnyQueryDef> = (
  options?: ReactiveRecord<SubscriptionOptions>,
) => readonly [
  trigger: (arg: UnwrapRef<QueryArgFrom<D>>) => void,
  lastArg: ComputedRef<QueryArgFrom<D> | UninitializedValue>,
]

export const createUseLazyQuerySubscription =
  <D extends AnyQueryDef>({ initiate }: any): UseLazyQuerySubscription<D> =>
  ({ refetchOnReconnect, refetchOnFocus, pollingInterval = 0 } = {}) => {
    const dispatch = useDispatch<ThunkDispatch<any, any, AnyAction>>()

    let arg = ref<QueryArgFrom<D> | UninitializedValue>(UNINITIALIZED_VALUE)
    let promiseRef = ref<QueryActionCreatorResult<D>>()

    const stableSubscriptionOptions = computed(() => ({
      refetchOnReconnect: unref(refetchOnReconnect),
      refetchOnFocus: unref(refetchOnFocus),
      pollingInterval: unref(pollingInterval),
    }))

    watchEffect((onCleanup) => {
      const promise = promiseRef.value
      onCleanup(() => {
        promise?.unsubscribe()
      })
    })

    watchEffect(() => {
      if (stableSubscriptionOptions !== promiseRef.value?.subscriptionOptions) {
        promiseRef.value?.updateSubscriptionOptions(
          stableSubscriptionOptions.value,
        )
      }
    })

    const trigger = (
      nextArg: UnwrapRef<QueryArgFrom<D>>,
      preferCacheValue = false,
    ) => {
      promiseRef = dispatch(
        initiate(nextArg, {
          subscriptionOptions: stableSubscriptionOptions,
          forceRefetch: !preferCacheValue,
        }),
      )
      arg = nextArg
    }

    /* if "cleanup on unmount" was triggered from a fast refresh, we want to reinstate the query */
    watchEffect(() => {
      const argValue = arg.value
      if (argValue !== UNINITIALIZED_VALUE && !promiseRef.value) {
        trigger(argValue, true)
      }
    })

    return [trigger, computed(() => arg.value)] as const
  }
