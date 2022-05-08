import { mount } from '@cypress/vue'
import { configureStore, SerializedError } from '@reduxjs/toolkit'

import { defineComponent, onUpdated, ref, watchEffect } from 'vue'
import { install } from './install'
import { createApi } from './query/createApi'
let amount = 0

function expectType<T>(value: T): T {
  return value
}

const api = createApi({
  baseQuery: async (arg: any) => {
    await fetch('/request')
    if (arg?.body && 'amount' in arg.body) {
      amount += 1
    }

    if (arg?.body && 'forceError' in arg.body) {
      return {
        error: {
          status: 500,
          data: null,
        },
      }
    }

    return {
      data: arg?.body ? { ...arg.body, ...(amount ? { amount } : {}) } : {},
    }
  },
  endpoints: (build) => ({
    getUser: build.query<{ name: string }, number>({
      query: () => ({
        body: { name: 'Timmy' },
      }),
    }),
    getUserAndForceError: build.query<{ name: string }, number>({
      query: () => ({
        body: {
          forceError: true,
        },
      }),
    }),
    getIncrementedAmount: build.query<any, void>({
      query: () => ({
        url: '',
        body: {
          amount,
        },
      }),
    }),
    updateUser: build.mutation<{ name: string }, { name: string }>({
      query: (update) => ({ body: update }),
    }),
    getError: build.query({
      query: (query) => '/error',
    }),
  }),
})

const getStore = () =>
  configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
  })

let store = getStore()

afterEach(() => {
  amount = 0
  store = getStore()
})

describe('useMutation', () => {
  it('useMutation hook sets and unsets the isLoading flag when running', () => {
    const User = defineComponent(() => {
      const [updateUser, { isLoading }] = api.endpoints.updateUser.useMutation()

      return () => (
        <div>
          <div id="isLoading">{String(isLoading.value)}</div>
          <button onClick={() => updateUser({ name: 'Banana' })}>
            Update User
          </button>
        </div>
      )
    })

    mount(User, {
      global: {
        plugins: [install(store)],
      },
    })

    cy.intercept('/request', { delay: 150 }).as('request')

    cy.get('#isLoading').contains('false')
    cy.contains('Update User').click()
    cy.get('#isLoading').contains('true')
    cy.wait('@request')
    cy.get('#isLoading').contains('false')
  })

  it('useMutation hook sets data to the resolved response on success', () => {
    const User = defineComponent(() => {
      const [updateUser, { data }] = api.endpoints.updateUser.useMutation()

      return () => (
        <div>
          <div id="result">{JSON.stringify(data.value)}</div>
          <button onClick={() => updateUser({ name: 'Banana' })}>
            Update User
          </button>
        </div>
      )
    })

    mount(User, {
      global: {
        plugins: [install(store)],
      },
    })

    cy.contains('Update User').click()
    cy.get('#result').contains(JSON.stringify({ name: 'Banana' }))
  })

  it('useMutation hook callback returns various properties to handle the result', () => {
    const User = defineComponent(() => {
      const [updateUser] = api.endpoints.updateUser.useMutation()
      const successMsg = ref('')
      const errMsg = ref('')
      const isAborted = ref(false)

      const handleClick = () => {
        const res = updateUser({ name: 'Banana' })

        // no-op simply for clearer type assertions
        res.then((result) => {
          expectType<
            | {
                error: { status: number; data: unknown } | SerializedError
              }
            | {
                data: {
                  name: string
                }
              }
          >(result)
        })

        expectType<{
          endpointName: string
          originalArgs: { name: string }
          track?: boolean
        }>(res.arg)
        expectType<string>(res.requestId)
        expectType<() => void>(res.abort)
        expectType<() => Promise<{ name: string }>>(res.unwrap)
        expectType<() => void>(res.reset)
        expectType<() => void>(res.unsubscribe)

        // abort the mutation immediately to force an error
        res.abort()
        res
          .unwrap()
          .then((result) => {
            expectType<{ name: string }>(result)
            successMsg.value = `Successfully updated user ${result.name}`
          })
          .catch((err) => {
            errMsg.value = `An error has occurred updating user ${res.arg.originalArgs.name}`
            if (err.name === 'AbortError') {
              isAborted.value = true
            }
          })
      }

      return () => (
        <div>
          <button onClick={handleClick}>Update User and abort</button>
          <div>{successMsg.value}</div>
          <div>{errMsg.value}</div>
          <div>{isAborted.value ? 'Request was aborted' : ''}</div>
        </div>
      )
    })

    mount(User, {
      global: {
        plugins: [install(store)],
      },
    })

    cy.contains(/An error has occurred/i).should('not.exist')
    cy.contains(/Successfully updated user/i).should('not.exist')
    cy.contains('Request was aborted').should('not.exist')

    cy.contains('Update User and abort').click()

    cy.contains('An error has occurred updating user Banana')

    cy.contains(/Successfully updated user/i).should('not.exist')
    cy.contains('Request was aborted')
  })

  it('`reset` sets state back to original state', () => {
    const User = defineComponent(() => {
      const [updateUser, result] = api.endpoints.updateUser.useMutation()
      return () => (
        <>
          <span>
            {result.isUninitialized.value
              ? 'isUninitialized'
              : result.isSuccess.value
              ? 'isSuccess'
              : 'other'}
          </span>
          <span>{result.originalArgs.value?.name}</span>
          <button onClick={() => updateUser({ name: 'Yay' })}>trigger</button>
          <button onClick={result.reset}>reset</button>
        </>
      )
    })

    mount(User, {
      global: {
        plugins: [install(store)],
      },
    })

    cy.intercept('/request', { delay: 150 }).as('request')

    cy.contains(/isUninitialized/i)
    cy.contains('Yay').should('not.exist')

    expect(Object.keys(store.getState().api.mutations)).to.have.lengthOf(0)

    cy.contains('trigger').click()
    cy.wait('@request').then(() => {
      expect(Object.keys(store.getState().api.mutations)).to.have.lengthOf(1)
    })
    cy.contains(/isSuccess/i)
    cy.contains('Yay')

    cy.contains('reset').click()
    cy.contains(/isUninitialized/i)

    cy.contains('Yay').should('not.exist')
    expect(Object.keys(store.getState().api.mutations)).to.have.lengthOf(0)
  })
})
