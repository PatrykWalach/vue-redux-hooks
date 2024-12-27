import type { Action, SerializedError, ThunkDispatch } from '@reduxjs/toolkit'
import type {
  BaseQueryError,
  BaseQueryFn,
} from '@reduxjs/toolkit/dist/query/baseQueryTypes'
import type {
  QueryStatus,
  SubscriptionOptions,
} from '@reduxjs/toolkit/dist/query/core/apiState'
import type {
  MutationActionCreatorResult,
  QueryActionCreatorResult,
} from '@reduxjs/toolkit/dist/query/core/buildInitiate'
import type {
  EndpointDefinitions,
  MutationDefinition,
  QueryArgFrom,
  QueryDefinition,
  ResultTypeFrom,
} from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import type { SkipToken } from '@reduxjs/toolkit/query'
import type { ComputedRef, Ref } from 'vue-demi'
import type { vueHooksModuleName } from './createApi'

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

export type UseQuery<D extends AnyQueryDef> = (
  arg: Reactive<QueryArgFrom<D> | SkipToken>,
  options?: ReactiveRecord<
    UseQuerySubscriptionOptions & UseQueryStateOptions<D>
  >,
) => UseQueryStateResult<D> & UseQuerySubscriptionResult<D>

export type DefinitionType = 'query' | 'mutation'

type QueryHooks<D extends QueryDefinition<any, any, any, any, any>> = {
  useQuery: UseQuery<D>
  // useLazyQuery: UseLazyQuery<D>
  useQuerySubscription: UseQuerySubscription<D>
  // useLazyQuerySubscription: UseLazyQuerySubscription<D>
  useQueryState: UseQueryState<D>
}

type MutationHooks<D extends MutationDefinition<any, any, any, any, any>> = {
  useMutation: UseMutation<D>
}

export type HooksWithUniqueNames<Definitions extends EndpointDefinitions> =
  keyof Definitions extends infer Keys
    ? Keys extends string
      ? Definitions[Keys] extends { type: 'query' }
        ? {
            [K in Keys as `use${Capitalize<K>}Query`]: UseQuery<
              Extract<Definitions[K], QueryDefinition<any, any, any, any>>
            >
          }
        : // &
          //   {
          //     [K in Keys as `useLazy${Capitalize<K>}Query`]: UseLazyQuery<
          //       Extract<Definitions[K], QueryDefinition<any, any, any, any>>
          //     >
          //   }
          Definitions[Keys] extends { type: 'mutation' }
          ? {
              [K in Keys as `use${Capitalize<K>}Mutation`]: UseMutation<
                Extract<Definitions[K], MutationDefinition<any, any, any, any>>
              >
            }
          : never
      : never
    : never

declare module '@reduxjs/toolkit/dist/query/apiTypes' {
  export interface ApiModules<
    // biome-ignore lint/correctness/noUnusedVariables: All declarations of 'ApiModules' must have identical type parameters.
    BaseQuery extends BaseQueryFn,
    Definitions extends EndpointDefinitions,
    // biome-ignore lint/correctness/noUnusedVariables: All declarations of 'ApiModules' must have identical type parameters.
    ReducerPath extends string,
    // biome-ignore lint/correctness/noUnusedVariables: All declarations of 'ApiModules' must have identical type parameters.
    TagTypes extends string,
  > {
    [vueHooksModuleName]: {
      /**
       * Endpoints based on the input endpoints provided to `createApi`,
       * containing `select`, `hooks` and `action matchers`.
       */
      endpoints: {
        [K in keyof Definitions]: Definitions[K] extends QueryDefinition<
          any,
          any,
          any,
          any,
          any
        >
          ? QueryHooks<Definitions[K]>
          : Definitions[K] extends MutationDefinition<any, any, any, any, any>
            ? MutationHooks<Definitions[K]>
            : never
      }
    } & HooksWithUniqueNames<Definitions>
  }
}

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

export interface UseQuerySubscriptionOptions extends SubscriptionOptions {
  /**
   * Prevents a query from automatically running.
   *
   * @remarks
   *   When `skip` is true (or `skipToken` is passed in as `arg`):
   *
   *   - **If the query has cached data:**
   *   - The cached data **will not be used** on the initial load, and will ignore
   *       updates from any identical query until the `skip` condition is
   *       removed
   *   - The query will have a status of `uninitialized`
   *   - If `skip: false` is set after skipping the initial load, the cached result
   *       will be used
   *   - **If the query does not have cached data:**
   *   - The query will have a status of `uninitialized`
   *   - The query will not exist in the state when viewed with the dev tools
   *   - The query will not automatically fetch on mount
   *   - The query will not automatically run when additional components with the
   *       same query are added that do run
   *
   * @example
   *   ;```tsx
   *   	  // codeblock-meta title="Skip example"
   *   	  const Pokemon = ({ name, skip }: { name: string; skip: boolean }) => {
   *   	    const { data, error, status } = useGetPokemonByNameQuery(name, {
   *   	      skip,
   *   	    });
   *
   *   	    return (
   *   	      <div>
   *   	        {name} - {status}
   *   	      </div>
   *   	    );
   *   	  };
   *   	  ```
   */
  readonly skip?: boolean
  /**
   * Defaults to `false`. This setting allows you to control whether if a cached
   * result is already available, RTK Query will only serve a cached result, or
   * if it should `refetch` when set to `true` or if an adequate amount of time
   * has passed since the last successful query result.
   *
   * - `false` - Will not cause a query to be performed _unless_ it does not exist
   *   yet.
   * - `true` - Will always refetch when a new subscriber to a query is added.
   *   Behaves the same as calling the `refetch` callback or passing
   *   `forceRefetch: true` in the action creator.
   * - `number` - **Value is in seconds**. If a number is provided and there is an
   *   existing query in the cache, it will compare the current time vs the last
   *   fulfilled timestamp, and only refetch if enough time has elapsed.
   *
   * If you specify this option alongside `skip: true`, this **will not be
   * evaluated** until `skip` is false.
   */
  readonly refetchOnMountOrArgChange?: boolean | number
}

export type UseQuerySubscriptionResult<_D extends AnyQueryDef> = {
  readonly refetch: () => void
}

export type UseQuerySubscription<D extends AnyQueryDef> = (
  arg: Reactive<QueryArgFrom<D> | SkipToken>,
  options?: ReactiveRecord<UseQuerySubscriptionOptions>,
) => UseQuerySubscriptionResult<D>

export type Reactive<T> = T | Ref<T>

export type ReactiveRecord<T> = {
  [K in keyof T]: Reactive<T[K]>
}

import type { shallowRef } from 'vue-demi'
import type { useDispatch } from '../hooks/useDispatch'

export type ShallowPromiseRef<D extends QueryDefinition<any, any, any, any>> =
  typeof shallowRef<undefined | QueryActionCreatorResult<D>>

export type UseThunkDispatch = () => ThunkDispatch<any, any, UnknownAction>

/**
 * An Action type which accepts any other properties.
 * This is mainly for the use of the `Reducer` type.
 * This is not part of `Action` itself to prevent types that extend `Action` from
 * having an index signature.
 */
export interface UnknownAction extends Action {
  [extraProps: string]: unknown
}
