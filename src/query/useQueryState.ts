import type { QuerySubState } from '@reduxjs/toolkit/dist/query/core/apiState'
import type {
  QueryArgFrom,
  QueryDefinition,
} from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import type {
  Id,
  NoInfer,
  Override,
} from '@reduxjs/toolkit/dist/query/tsHelpers'
import { QueryStatus, skipToken, SkipToken } from '@reduxjs/toolkit/query'
import { computed, reactive } from 'vue-demi'
import { useSelector } from '../hooks/useSelector'
import { Reactive, ReactiveRecord, refToReactive } from './util'

export type UseQueryStateBaseResult<
  D extends QueryDefinition<any, any, any, any>,
> = QuerySubState<D> & {
  /**
   * Query has not started yet.
   */
  isUninitialized: false
  /**
   * Query is currently loading for the first time. No data yet.
   */
  isLoading: false
  /**
   * Query is currently fetching, but might have data from an earlier request.
   */
  isFetching: false
  /**
   * Query has data from a successful load.
   */
  isSuccess: false
  /**
   * Query is currently in "error" state.
   */
  isError: false
}

export type UseQueryStateDefaultResult<
  D extends QueryDefinition<any, any, any, any>,
> = Id<
  | Override<
      Extract<
        UseQueryStateBaseResult<D>,
        { status: QueryStatus.uninitialized }
      >,
      { isUninitialized: true }
    >
  | Override<
      UseQueryStateBaseResult<D>,
      | { isLoading: true; isFetching: boolean; data: undefined }
      | ({
          isSuccess: true
          isFetching: boolean
          error: undefined
        } & Required<
          Pick<UseQueryStateBaseResult<D>, 'data' | 'fulfilledTimeStamp'>
        >)
      | ({ isError: true } & Required<
          Pick<UseQueryStateBaseResult<D>, 'error'>
        >)
    >
>

export type UseQueryStateOptions<
  D extends QueryDefinition<any, any, any, any>,
  R extends Record<string, any>,
> = {
  /**
   * Prevents a query from automatically running.
   *
   * @remarks
   * When skip is true:
   *
   * - **If the query has cached data:**
   *   * The cached data **will not be used** on the initial load, and will ignore updates from any identical query until the `skip` condition is removed
   *   * The query will have a status of `uninitialized`
   *   * If `skip: false` is set after skipping the initial load, the cached result will be used
   * - **If the query does not have cached data:**
   *   * The query will have a status of `uninitialized`
   *   * The query will not exist in the state when viewed with the dev tools
   *   * The query will not automatically fetch on mount
   *   * The query will not automatically run when additional components with the same query are added that do run
   *
   * @example
   * ```ts
   * // codeblock-meta title="Skip example"
   * const Pokemon = ({ name, skip }: { name: string; skip: boolean }) => {
   *   const { data, error, status } = useGetPokemonByNameQuery(name, {
   *     skip,
   *   });
   *
   *   return (
   *     <div>
   *       {name} - {status}
   *     </div>
   *   );
   * };
   * ```
   */
  skip?: boolean
}

export type UseQueryState<D extends QueryDefinition<any, any, any, any>> = <
  R = UseQueryStateDefaultResult<D>,
>(
  arg: Reactive<QueryArgFrom<D> | SkipToken>,
  options?: ReactiveRecord<UseQueryStateOptions<D, R>>,
) => UseQueryStateResult<D, R>

export type UseQueryStateResult<
  _ extends QueryDefinition<any, any, any, any>,
  R,
> = NoInfer<R>

export const createUseQueryState =
  <D extends QueryDefinition<any, any, any, any>>(
    endpoint: any,
  ): UseQueryState<D> =>
  (arg, { skip = false } = {}) => {
    const options = reactive({ skip, arg })

    const stableArg = computed(() => (options.skip ? skipToken : options.arg))

    const selector = computed(() => endpoint.select(stableArg.value))

    const result = useSelector((state) => selector.value(state))

    return refToReactive(result, [
      'isUninitialized',
      'isLoading',
      'isSuccess',
      'isError',
      'data',
      'error',
      'status',
      'startedTimeStamp',
      'requestId',
      'originalArgs',
      'fulfilledTimeStamp',
      'endpointName',
    ])
  }
