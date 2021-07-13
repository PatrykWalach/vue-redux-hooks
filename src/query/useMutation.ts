import type { AnyAction, ThunkDispatch } from '@reduxjs/toolkit'
import type { MutationActionCreatorResult } from '@reduxjs/toolkit/dist/query/core/buildInitiate'
import type { MutationResultSelectorResult } from '@reduxjs/toolkit/dist/query/core/buildSelectors'
import type { ApiEndpointMutation } from '@reduxjs/toolkit/dist/query/core/module'
import type {
  EndpointDefinitions,
  MutationDefinition,
  QueryArgFrom,
} from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import type { NoInfer } from '@reduxjs/toolkit/dist/query/tsHelpers'
import { skipToken } from '@reduxjs/toolkit/query'
import { computed, shallowRef, watchEffect, onBeforeUnmount } from 'vue-demi'
import { useDispatch } from '../hooks/useDispatch'
import { useSelector } from '../hooks/useSelector'
import { refToReactive } from './util'

export type UseMutationStateResult<
  _ extends MutationDefinition<any, any, any, any>,
  R,
> = NoInfer<R>

export type UseMutation<D extends MutationDefinition<any, any, any, any>> = <
  R extends Record<string, any> = MutationResultSelectorResult<D>,
>() => [
  (arg: QueryArgFrom<D>) => MutationActionCreatorResult<D>,
  UseMutationStateResult<D, R>,
]
export const createUseMutation =
  <D extends MutationDefinition<any, any, any, any>>(
    endpoint: ApiEndpointMutation<
      MutationDefinition<any, any, any, any, any>,
      EndpointDefinitions
    >,
  ): UseMutation<D> =>
  () => {
    const dispatch = useDispatch<ThunkDispatch<any, any, AnyAction>>()

    const promiseRef = shallowRef<MutationActionCreatorResult<any>>()

    // onBeforeUnmount(() => {
    //   promiseRef.value && promiseRef.value.unsubscribe()
    // })
    watchEffect((onCleanup) => {
      const promise = promiseRef.value
      onCleanup(() => {
        promise && promise.unsubscribe()
      })
    })

    const triggerMutation = (arg: any) => {
      // promiseRef.value && promiseRef.value.unsubscribe()
      const promise = dispatch(endpoint.initiate(arg))
      promiseRef.value = promise
      return promise
    }

    const requestId = computed(
      () => promiseRef.value && promiseRef.value.requestId,
    )

    const mutationSelector = computed(() =>
      endpoint.select(requestId.value || skipToken),
    )

    const currentState = useSelector((state) => mutationSelector.value(state))

    return [
      triggerMutation,
      refToReactive(currentState, [
        'originalArgs',
        'data',
        'error',
        'endpointName',
        'fulfilledTimeStamp',
        'isUninitialized',
        'isLoading',
        'isSuccess',
        'isError',
        'startedTimeStamp',
      ]),
    ] as any
  }
