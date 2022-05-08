let amount = 0

function expectType<T>(value: T): T {
  return value
}

const api = createApi({
  baseQuery: async (arg: any) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
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

import { mount } from '@cypress/vue'
import { configureStore, SerializedError } from '@reduxjs/toolkit'
import { defineComponent, ref } from 'vue'
import { install } from './install'
import { createApi } from './query/createApi'

describe('useMutation', () => {
  test('useMutation hook sets and unsets the isLoading flag when running', async () => {
    const User = defineComponent(() => {
      const [updateUser, { isLoading }] = api.endpoints.updateUser.useMutation()

      return () => (
        <div>
          <div id="isLoading">{String(isLoading)}</div>
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

    cy.get('#isLoading').contains('false')
    cy.contains('Update User').click()
    cy.get('#isLoading').contains('true')
    cy.get('#isLoading').contains('false')
  })

  test('useMutation hook sets data to the resolved response on success', async () => {
    const User = defineComponent(() => {
      const [updateUser, { data }] = api.endpoints.updateUser.useMutation()

      return () => (
        <div>
          <div id="result">{JSON.stringify(data)}</div>
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

  test('useMutation hook callback returns various properties to handle the result', async () => {
    const User = defineComponent(() => {
      const [updateUser] = api.endpoints.updateUser.useMutation()
      const successMsg = ref('')
      const errMsg = ref('')
      const isAborted = ref(false)

      const handleClick = async () => {
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
          <div>{successMsg}</div>
          <div>{errMsg}</div>
          <div>{isAborted ? 'Request was aborted' : ''}</div>
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

  // test('useMutation return value contains originalArgs', async () => {
  //   const { result } = renderHook(api.endpoints.updateUser.useMutation, {
  //     wrapper: storeRef.wrapper,
  //   })
  //   const arg = { name: 'Foo' }

  //   const firstRenderResult = result.current
  //   expect(firstRenderResult[1].originalArgs).toBe(undefined)
  //   act(() => void firstRenderResult[0](arg))
  //   const secondRenderResult = result.current
  //   expect(firstRenderResult[1].originalArgs).toBe(undefined)
  //   expect(secondRenderResult[1].originalArgs).toBe(arg)
  // })

  test('`reset` sets state back to original state', async () => {
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
    cy.contains(/isUninitialized/i)
    cy.contains('Yay').should('not.exist')

    expect(Object.keys(store.getState().api.mutations)).to.have.lengthOf(0)

    cy.contains('trigger').click()
    cy.contains(/isSuccess/i)
    cy.contains('Yay')

    expect(Object.keys(store.getState().api.mutations)).to.have.lengthOf(1)

    cy.contains('reset').click()

    cy.contains(/isUninitialized/i)

    cy.contains('Yay').should('not.exist')
    expect(Object.keys(store.getState().api.mutations)).to.have.lengthOf(0)
  })
})
