import type {
  ApiEndpointQuery,
  CoreModule,
} from '@reduxjs/toolkit/dist/query/core/module'
import type { EndpointDefinitions } from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import {
  type CreateApi,
  type Module,
  buildCreateApi,
  coreModule,
} from '@reduxjs/toolkit/query'
import { type AnyQueryDef, type QueryHooks } from './types'
import { createUseMutation } from './useMutation'
import { createUseQuery } from './useQuery'
import { createUseQueryState } from './useQueryState'
import { createUseQuerySubscription } from './useQuerySubscription'

export const vueHooksModuleName = Symbol('vueHooksModule')

const capitalize = (str: string) => str[0]?.toUpperCase() + str.substring(1)

const vueHooksModule = (): Module<typeof vueHooksModuleName> => ({
  name: vueHooksModuleName,
  init(api) {
    return {
      injectEndpoint(endpointName, definition) {
        const endpoint: any = api.endpoints[endpointName]
        const capitalizedEndpointName = capitalize(endpointName)

        if (definition.type === 'query') {
          const queryHooks = createQueryHooks(endpoint)

          Object.assign(endpoint, queryHooks)
          Object.assign(api, {
            [`use${capitalizedEndpointName}Query`]: queryHooks.useQuery,
            // [`useLazy${capitalizedEndpointName}Query`]:  queryHooks.useLazyQuery
          })

          return
        }

        if (definition.type === 'mutation') {
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
