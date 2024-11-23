/** @import { ApiEndpointQuery, CoreModule } from '@reduxjs/toolkit/dist/query/core/module' */
/** @import { EndpointDefinitions } from '@reduxjs/toolkit/dist/query/endpointDefinitions' */
/** @import { CreateApi, Module } from '@reduxjs/toolkit/query' */
/** @import { AnyQueryDef, QueryHooks } from './types' */
import { buildCreateApi, coreModule, } from '@reduxjs/toolkit/query';
import { createUseMutation } from './useMutation';
import { createUseQuery } from './useQuery';
import { createUseQueryState } from './useQueryState';
import { createUseQuerySubscription } from './useQuerySubscription';
export const vueHooksModuleName = Symbol('vueHooksModule');
/**
 * @param {string} str
 * @returns {string}
 */
const capitalize = (str) => str[0]?.toUpperCase() + str.substring(1);
/**
 * @returns {Module<typeof vueHooksModuleName>}
 */
const vueHooksModule = () => ({
    name: vueHooksModuleName,
    init(api) {
        return {
            injectEndpoint(endpointName, definition) {
                const endpoint = api.endpoints[endpointName];
                const capitalizedEndpointName = capitalize(endpointName);
                if (definition.type === 'query') {
                    const queryHooks = createQueryHooks(endpoint);
                    Object.assign(endpoint, queryHooks);
                    Object.assign(api, {
                        [`use${capitalizedEndpointName}Query`]: queryHooks.useQuery,
                        // [`useLazy${capitalizedEndpointName}Query`]:  queryHooks.useLazyQuery
                    });
                    return;
                }
                if (definition.type === 'mutation') {
                    const useMutation = createUseMutation(api, endpoint);
                    Object.assign(endpoint, {
                        useMutation,
                    });
                    Object.assign(api, {
                        [`use${capitalizedEndpointName}Mutation`]: useMutation,
                    });
                    return;
                }
            },
        };
    },
});
export const createApi = buildCreateApi(coreModule(), vueHooksModule());
/**
 * @template {AnyQueryDef} D
 * @param {ApiEndpointQuery<D, EndpointDefinitions>} endpoint
 * @returns {QueryHooks<D>}
 */
const createQueryHooks = (endpoint) => ({
    useQueryState: createUseQueryState(endpoint),
    useQuery: createUseQuery(endpoint),
    useQuerySubscription: createUseQuerySubscription(endpoint),
});
