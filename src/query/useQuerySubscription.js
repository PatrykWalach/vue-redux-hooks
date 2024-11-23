/** @import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit' */
/** @import { QueryActionCreatorResult } from '@reduxjs/toolkit/dist/query/core/buildInitiate' */
/** @import { ApiEndpointQuery } from '@reduxjs/toolkit/dist/query/core/module' */
/** @import { AnyQueryDef, UseQuerySubscription, ShallowPromiseRef, UseThunkDispatch } from './types' */
/** @import { EndpointDefinitions } from '@reduxjs/toolkit/dist/query/endpointDefinitions' */
import { skipToken } from '@reduxjs/toolkit/query';
import { computed, onBeforeUnmount, shallowRef, unref, watch } from 'vue-demi';
import { useDispatch } from '../hooks/useDispatch';
/**
 * @template {AnyQueryDef} D
 * @param {ApiEndpointQuery<D, EndpointDefinitions>} endpoint
 * @returns {UseQuerySubscription<D>}
 */
export const createUseQuerySubscription = (endpoint) => (arg, { skip = false, pollingInterval = 0, refetchOnMountOrArgChange, ...options } = {}) => {
    const stableArg = computed(() => (unref(skip) ? skipToken : unref(arg)));
    const stableSubscriptionOptions = computed(() => ({
        refetchOnReconnect: unref(options.refetchOnReconnect),
        refetchOnFocus: unref(options.refetchOnFocus),
        pollingInterval: unref(pollingInterval),
    }));
		/** @type {ShallowPromiseRef<D>}*/
		let shallowPromiseRef = shallowRef
    const promiseRef = shallowPromiseRef(undefined);
		/** @type {UseThunkDispatch}*/
		let useThunkDispatch = useDispatch
    const dispatch = useThunkDispatch();
    watch([
        stableArg,
        computed(() => unref(refetchOnMountOrArgChange)),
        stableSubscriptionOptions,
    ], ([stableArg, forceRefetch, subscriptionOptions]) => {
        const lastPromise = promiseRef.value;
        if (stableArg === skipToken) {
            lastPromise?.unsubscribe();
            promiseRef.value = undefined;
            return;
        }
        const lastSubscriptionOptions = lastPromise?.subscriptionOptions;
        if (!lastPromise || lastPromise.arg !== stableArg) {
            lastPromise?.unsubscribe();
            const promise = dispatch(endpoint.initiate(stableArg, {
                subscriptionOptions,
                forceRefetch,
            }));
            promiseRef.value = promise;
            return;
        }
        if (stableSubscriptionOptions !== lastSubscriptionOptions) {
            lastPromise.updateSubscriptionOptions(subscriptionOptions);
        }
    }, { immediate: true });
    onBeforeUnmount(() => {
        promiseRef.value?.unsubscribe();
    });
    return {
        refetch() {
            promiseRef.value?.refetch();
        },
    };
};
