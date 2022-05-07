import type {
  AnyAction,
  SerializedError,
  ThunkDispatch,
} from '@reduxjs/toolkit'
import { BaseQueryError } from '@reduxjs/toolkit/dist/query/baseQueryTypes'
import type { MutationActionCreatorResult } from '@reduxjs/toolkit/dist/query/core/buildInitiate'
import { ApiEndpointMutation } from '@reduxjs/toolkit/dist/query/core/module'
import type {
  EndpointDefinitions,
  MutationDefinition,
  QueryArgFrom,
} from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import { skipToken } from '@reduxjs/toolkit/query'
import { computed, ComputedRef, shallowRef, watchEffect } from 'vue-demi'
import { useDispatch } from '../hooks/useDispatch'
import { useSelector } from '../hooks/useSelector'

export type MutationTrigger<D extends MutationDefinition<any, any, any, any>> =
  (arg: QueryArgFrom<D>) => MutationActionCreatorResult<D>

export type MutationError<D> =
  | SerializedError
  | (D extends MutationDefinition<any, infer BaseQuery, any, any>
      ? BaseQueryError<BaseQuery>
      : never)

export type UseMutationResult<D extends AnyMutDef> = {
  readonly data: ComputedRef<null | undefined | QueryArgFrom<D>>
  readonly endpointName: ComputedRef<null | undefined | string>
  readonly error: ComputedRef<null | undefined | MutationError<D>>
  readonly fulfilledTimeStamp: ComputedRef<null | undefined | number>
  readonly isError: ComputedRef<boolean>
  readonly isLoading: ComputedRef<boolean>
  readonly isSuccess: ComputedRef<boolean>
  readonly isUninitialized: ComputedRef<boolean>
  readonly originalArgs: ComputedRef<null | undefined | QueryArgFrom<D>>
  readonly startedTimeStamp: ComputedRef<null | undefined | number>
}

export type UseMutation<D extends AnyMutDef> = () => readonly [
  MutationTrigger<D>,
  UseMutationResult<D>,
]

export type AnyMutDef = MutationDefinition<any, any, any, any>

export const createUseMutation =
  <D extends AnyMutDef>(
    endpoint: ApiEndpointMutation<D, EndpointDefinitions>,
  ): UseMutation<D> =>
  () => {
    const dispatch = useDispatch<ThunkDispatch<any, any, AnyAction>>()

    const promiseRef = shallowRef<MutationActionCreatorResult<D>>()

    watchEffect((onCleanup) => {
      const promise = promiseRef.value
      onCleanup(() => {
        promise?.unsubscribe()
      })
    })

    const triggerMutation = (arg: QueryArgFrom<D>) => {
      const promise = dispatch(endpoint.initiate(arg))
      promiseRef.value = promise
      return promise
    }

    const requestId = computed(() => promiseRef.value?.requestId)

    const mutationSelector = computed(() =>
      endpoint.select(requestId.value || skipToken),
    )

    const currentState = useSelector(mutationSelector)

    return [
      triggerMutation,
      {
        originalArgs: computed(() => currentState.value.originalArgs),
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
