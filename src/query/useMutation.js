/** @import { AnyAction, SerializedError, ThunkDispatch } from '@reduxjs/toolkit' */
/** @import { BaseQueryError } from '@reduxjs/toolkit/dist/query/baseQueryTypes' */
/** @import { MutationActionCreatorResult } from '@reduxjs/toolkit/dist/query/core/buildInitiate' */
/** @import { ApiEndpointMutation } from '@reduxjs/toolkit/dist/query/core/module' */
/** @import { EndpointDefinitions, MutationDefinition, QueryArgFrom } from '@reduxjs/toolkit/dist/query/endpointDefinitions' */
/** @import { Api } from '@reduxjs/toolkit/query' */
/** @import { AnyMutDef, UseMutation } from './types' */
/** @import { ComputedRef } from 'vue-demi' */
import { computed, shallowRef, watchEffect } from 'vue-demi';
import { useDispatch } from '../hooks/useDispatch';
import { useSelector } from '../hooks/useSelector';
/**
 * @template {AnyMutDef} D
 * @param {Api<any, EndpointDefinitions, any, any>} api
 * @param {ApiEndpointMutation<D, EndpointDefinitions>} endpoint
 * @returns {UseMutation<D>}
 */
export const createUseMutation = (api, endpoint) => ({ fixedCacheKey } = {}) => {
    const dispatch = useDispatch();
    const promiseRef = shallowRef();
    watchEffect((onCleanup) => {
        const promise = promiseRef.value;
        onCleanup(() => {
            if (!promise?.arg.fixedCacheKey) {
                promise?.reset();
            }
        });
    });
    const triggerMutation = (arg) => {
        const promise = dispatch(endpoint.initiate(arg, { fixedCacheKey }));
        promiseRef.value = promise;
        return promise;
    };
    const requestId = computed(() => promiseRef.value?.requestId);
    const mutationSelector = computed(() => endpoint.select({
        fixedCacheKey,
        requestId: requestId.value,
    }));
    const currentState = useSelector(mutationSelector);
    const originalArgs = computed(() => fixedCacheKey == null ? promiseRef.value?.arg.originalArgs : undefined);
    const reset = () => {
        const promise = promiseRef.value;
        if (promise) {
            promiseRef.value = undefined;
        }
        if (fixedCacheKey) {
            dispatch(api.internalActions.removeMutationResult({
                requestId: requestId.value,
                fixedCacheKey,
            }));
        }
    };
    return [
        triggerMutation,
        {
            originalArgs,
            reset,
            data: computed(() => currentState.value.data),
            error: computed(() => currentState.value.error),
            endpointName: computed(() => currentState.value.endpointName),
            fulfilledTimeStamp: computed(() => currentState.value.fulfilledTimeStamp),
            isUninitialized: computed(() => currentState.value.isUninitialized),
            isLoading: computed(() => currentState.value.isLoading),
            isSuccess: computed(() => currentState.value.isSuccess),
            isError: computed(() => currentState.value.isError),
            startedTimeStamp: computed(() => currentState.value.startedTimeStamp),
        },
    ];
};
