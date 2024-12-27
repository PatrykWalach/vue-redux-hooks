/** @import {ApiEndpointQuery} from '@reduxjs/toolkit/dist/query/core/module' */
/** @import {EndpointDefinitions} from '@reduxjs/toolkit/dist/query/endpointDefinitions' */
/** @import {AnyQueryDef, UseQuery} from './types' */

import { createUseQueryState } from './useQueryState'
import { createUseQuerySubscription } from './useQuerySubscription'
/**
 * @template {AnyQueryDef} D
 * @param {ApiEndpointQuery<D, EndpointDefinitions>} endpoint
 * @returns {UseQuery<D>}
 */
export const createUseQuery = (endpoint) => {
  const useQueryState = createUseQueryState(endpoint)
  const useQuerySubscription = createUseQuerySubscription(endpoint)
  return (arg, options) => {
    return {
      ...useQueryState(arg, options),
      ...useQuerySubscription(arg, options),
    }
  }
}
