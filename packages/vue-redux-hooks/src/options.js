/** @import {AnyAction} from 'redux' */
/** @import {GetAction, GetState} from './hooks/types' */
/** @import {MapDispatchResult, MapStateResult} from './types' */

/**
 * @template This
 * @template [S=GetState] Default is `GetState`
 * @returns {<
 *   M extends Record<string, ((this: This, state: S) => unknown) | keyof S>,
 * >(
 *   map: M,
 * ) => MapStateResult<This, S, M>}
 */
export function mapState() {
  /**
   * @template {Record<string, ((this: This, state: S) => unknown) | keyof S>} M
   * @param {M} map
   * @returns {MapStateResult<This, S, M>}
   */
  return (map) => {
    return /** @type {MapStateResult<This, S, M>} */ (
      Object.fromEntries(
        Object.entries(map).map(([key, value]) => {
          const computed =
            typeof value === 'function'
              ? /** @this {any} */
                function () {
                  return value.call(this, this.$redux.state)
                }
              : /** @this {any} */
                function () {
                  return this.$redux.state[value]
                }
          return [key, computed]
        }),
      )
    )
  }
}
/**
 * @template This
 * @template {AnyAction} [A=GetAction] Default is `GetAction`
 * @returns {<M extends Record<string, (...args: unknown[]) => A> = any>(
 *   map: M,
 * ) => MapDispatchResult<This, M>}
 */
export function mapDispatch() {
  /**
   * @template {Record<string, (...args: unknown[]) => A>} M
   * @param {M} map
   * @returns {MapDispatchResult<This, M>}
   */
  return (map) => {
    return /** @type {MapDispatchResult<This, M>} */ (
      Object.fromEntries(
        Object.entries(map).map(([key, value]) => {
          if (typeof value !== 'function') {
            throw new TypeError('mapDispatch must be a function')
          }

          /**
           * @param {...unknown} args
           * @this {any}
           */
          const computed = function (...args) {
            return this.$redux.store.dispatch(value.call(this, ...args))
          }
          return [key, computed]
        }),
      )
    )
  }
}
