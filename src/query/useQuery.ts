import type { ApiEndpointQuery } from '@reduxjs/toolkit/dist/query/core/module'
import type { EndpointDefinitions } from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import type { AnyQueryDef, UseQuery } from './types'
import { createUseQueryState } from './useQueryState'
import { createUseQuerySubscription } from './useQuerySubscription'

export const createUseQuery = <D extends AnyQueryDef>(
  endpoint: ApiEndpointQuery<D, EndpointDefinitions>,
): UseQuery<D> => {
  const useQueryState = createUseQueryState(endpoint)
  const useQuerySubscription = createUseQuerySubscription(endpoint)

  return (arg, options) => {
    return {
      ...useQueryState(arg, options),
      ...useQuerySubscription(arg, options),
    }
  }
}
