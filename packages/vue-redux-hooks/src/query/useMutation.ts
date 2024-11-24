import type {
  SerializedError,
  ThunkDispatch,
} from '@reduxjs/toolkit'
import type { BaseQueryError } from '@reduxjs/toolkit/dist/query/baseQueryTypes'
import type { MutationActionCreatorResult } from '@reduxjs/toolkit/dist/query/core/buildInitiate'
import type { ApiEndpointMutation } from '@reduxjs/toolkit/dist/query/core/module'
import type {
  EndpointDefinitions,
  MutationDefinition,
  QueryArgFrom,
} from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import type { Api } from '@reduxjs/toolkit/query'
import { type ComputedRef, computed, shallowRef, watchEffect } from 'vue-demi'
import { useDispatch } from '../hooks/useDispatch'
import { useSelector } from '../hooks/useSelector'
import type { UnknownAction } from './util'

export type MutationTrigger<D extends MutationDefinition<any, any, any, any>> =
  (arg: QueryArgFrom<D>) => MutationActionCreatorResult<D>

export type MutationError<D> =
  | SerializedError
  | (D extends MutationDefinition<any, infer BaseQuery, any, any>
      ? BaseQueryError<BaseQuery>
      : never)

export type UseMutationResult<D extends AnyMutDef> = {
  readonly data: ComputedRef<null | undefined | QueryArgFrom<D>>
  readonly originalArgs: ComputedRef<null | undefined | QueryArgFrom<D>>
  readonly reset: () => void
  readonly endpointName: ComputedRef<null | undefined | string>
  readonly error: ComputedRef<null | undefined | MutationError<D>>
  readonly fulfilledTimeStamp: ComputedRef<null | undefined | number>
  readonly isError: ComputedRef<boolean>
  readonly isLoading: ComputedRef<boolean>
  readonly isSuccess: ComputedRef<boolean>
  readonly isUninitialized: ComputedRef<boolean>
  readonly startedTimeStamp: ComputedRef<null | undefined | number>
}

export type UseMutationOptions<_D> = {
  readonly fixedCacheKey?: string
}

export type UseMutation<D extends AnyMutDef> = (
  options?: UseMutationOptions<D>,
) => readonly [MutationTrigger<D>, UseMutationResult<D>]

export type AnyMutDef = MutationDefinition<any, any, any, any>

export const createUseMutation =
  <D extends AnyMutDef>(
    api: Api<any, EndpointDefinitions, any, any>,
    endpoint: ApiEndpointMutation<D, EndpointDefinitions>,
  ): UseMutation<D> =>
  ({ fixedCacheKey } = {}) => {
    const dispatch = useDispatch<ThunkDispatch<any, any, UnknownAction>>()

    const promiseRef = shallowRef<MutationActionCreatorResult<D>>()

    watchEffect((onCleanup) => {
      const promise = promiseRef.value
      onCleanup(() => {
        if (!promise?.arg.fixedCacheKey) {
          promise?.reset()
        }
      })
    })

    const triggerMutation = (arg: QueryArgFrom<D>) => {
      const promise = dispatch(endpoint.initiate(arg, { fixedCacheKey }))
      promiseRef.value = promise
      return promise
    }

    const requestId = computed(() => promiseRef.value?.requestId)

    const mutationSelector = computed(() =>
      endpoint.select({
        fixedCacheKey,
        requestId: requestId.value,
      }),
    )

    const currentState = useSelector(mutationSelector)

    const originalArgs = computed(() =>
      fixedCacheKey == null ? promiseRef.value?.arg.originalArgs : undefined,
    )
    const reset = () => {
      const promise = promiseRef.value
      if (promise) {
        promiseRef.value = undefined
      }
      if (fixedCacheKey) {
        dispatch(
          api.internalActions.removeMutationResult({
            requestId: requestId.value,
            fixedCacheKey,
          }),
        )
      }
    }

    return [
      triggerMutation,
      {
        originalArgs,
        reset,
        data: computed(() => currentState.value.data),
        error: computed(() => currentState.value.error),
        endpointName: computed(() => currentState.value.endpointName),
        fulfilledTimeStamp: computed(
          () => currentState.value.fulfilledTimeStamp,
        ),
        isUninitialized: computed(() => currentState.value.isUninitialized),
        isLoading: computed(() => currentState.value.isLoading),
        isSuccess: computed(() => currentState.value.isSuccess),
        isError: computed(() => currentState.value.isError),
        startedTimeStamp: computed(() => currentState.value.startedTimeStamp),
      },
    ] as const
  }
