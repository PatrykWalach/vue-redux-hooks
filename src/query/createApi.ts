import type {
  ApiEndpointQuery,
  CoreModule,
} from '@reduxjs/toolkit/dist/query/core/module'
import type {
  EndpointDefinitions,
  MutationDefinition,
  QueryDefinition,
} from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import {
  type BaseQueryFn,
  type CreateApi,
  type Module,
  buildCreateApi,
  coreModule,
} from '@reduxjs/toolkit/query'
import { type UseMutation, createUseMutation } from './useMutation'
import { type UseQuery, createUseQuery } from './useQuery'
import {
  type AnyQueryDef,
  type UseQueryState,
  createUseQueryState,
} from './useQueryState'
import {
  type UseQuerySubscription,
  createUseQuerySubscription,
} from './useQuerySubscription'

export enum DefinitionType {
  query = 'query',
  mutation = 'mutation',
}

export const vueHooksModuleName = Symbol('vueHooksModule')

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
      ? Definitions[Keys] extends { type: DefinitionType.query }
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
          Definitions[Keys] extends { type: DefinitionType.mutation }
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    BaseQuery extends BaseQueryFn,
    Definitions extends EndpointDefinitions,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ReducerPath extends string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TagTypes extends string,
  > {
    [vueHooksModuleName]: {
      /**
       *  Endpoints based on the input endpoints provided to `createApi`, containing `select`, `hooks` and `action matchers`.
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

const capitalize = (str: string) => str[0]?.toUpperCase() + str.substring(1)

const vueHooksModule = (): Module<typeof vueHooksModuleName> => ({
  name: vueHooksModuleName,
  init(api) {
    return {
      injectEndpoint(endpointName, definition) {
        const endpoint: any = api.endpoints[endpointName]
        const capitalizedEndpointName = capitalize(endpointName)

        if (definition.type === DefinitionType.query) {
          const queryHooks = createQueryHooks(endpoint)

          Object.assign(endpoint, queryHooks)
          Object.assign(api, {
            [`use${capitalizedEndpointName}Query`]: queryHooks.useQuery,
            // [`useLazy${capitalizedEndpointName}Query`]:  queryHooks.useLazyQuery
          })

          return
        }

        if (definition.type === DefinitionType.mutation) {
          const useMutation = createUseMutation(api, endpoint)
          Object.assign(endpoint, {
            useMutation,
          })

          Object.assign(api, {
            [`use${capitalizedEndpointName}Mutation`]: useMutation,
          })
          return
        }
      },
    }
  },
})

export const createApi: CreateApi<typeof vueHooksModuleName | CoreModule> =
  buildCreateApi(coreModule(), vueHooksModule())

const createQueryHooks = <D extends AnyQueryDef>(
  endpoint: ApiEndpointQuery<D, EndpointDefinitions>,
): QueryHooks<D> => ({
  useQueryState: createUseQueryState(endpoint),
  useQuery: createUseQuery(endpoint),
  useQuerySubscription: createUseQuerySubscription(endpoint),
})
