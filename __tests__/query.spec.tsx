import { configureStore, SerializedError } from '@reduxjs/toolkit'
import { QueryStatus } from '@reduxjs/toolkit/dist/query'
import { mount } from 'cypress/vue'
import {
  computed,
  defineComponent,
  onBeforeUpdate,
  ref,
  watchEffect,
} from 'vue'
import { install } from '../src'
import { createApi } from '../src'
let amount = 0

function expectType<T>(value: T): T {
  return value
}

const api = createApi({
  baseQuery: async (arg: {
    body?: { amount?: number; forceError?: unknown; name?: string }
  }) => {
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
    getIncrementedAmount: build.query<{ amount: number }, void>({
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
      query: () => ({}),
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

let count = 0

const useRenderCounter = () => {
  onBeforeUpdate(() => {
    count++
  })

  count++
}

afterEach(() => {
  amount = 0
  store = getStore()
  count = 0
})

const WithRemount = defineComponent((_, ctx) => {
  const key = ref(0)

  return () => (
    <>
      <div key={key.value}>{ctx.slots.default?.()}</div>
      <button onClick={() => (key.value += 1)} id="remount">
        Remount
      </button>
    </>
  )
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

describe('useQuery', () => {
  it('useQuery hook basic render count assumptions', () => {
    const User = defineComponent(() => {
      const { isFetching } = api.endpoints.getUser.useQuery(1)

      useRenderCounter()

      return () => (
        <div>
          <div id="isFetching">{String(isFetching.value)}</div>
          <div id="count">{count}</div>
        </div>
      )
    })

    cy.intercept('/request', { delay: 150 }).as('request')

    mount(User, {
      global: {
        plugins: [install(store)],
      },
    })

    cy.get('#isFetching').should('contain', 'true')
    cy.get('#count').should('contain', '1')

    cy.wait('@request')
    cy.get('#isFetching').should('contain', 'false')
    cy.get('#count').should('contain', '2')
  })

  it('useQuery hook sets isFetching=true whenever a request is in flight', () => {
    const User = defineComponent(() => {
      const value = ref(0)

      const { isFetching } = api.endpoints.getUser.useQuery(1, {
        skip: computed(() => value.value < 1),
      })

      useRenderCounter()

      return () => (
        <div>
          <div id="isFetching">{String(isFetching.value)}</div>
          <button onClick={() => (value.value += 1)}>Increment value</button>
          <div id="count">{count}</div>
        </div>
      )
    })

    cy.intercept('/request', { delay: 150 }).as('request')

    mount(User, {
      global: {
        plugins: [install(store)],
      },
    })

    cy.get('#count').should('contain', '1')

    cy.get('#isFetching').should('contain', 'false')
    cy.contains('Increment value').click() // setState = 1, perform request = 2
    cy.get('#isFetching').should('contain', 'true')
    cy.wait('@request')
    cy.get('#isFetching').should('contain', 'false')
    cy.get('#count').should('contain', '3')

    cy.contains('Increment value').click()
    // Being that nothing has changed in the args, this should never fire.

    cy.get('#isFetching').should('contain', 'false')
    cy.get('#count').should('contain', '4') // even though there was no request, the button click updates the state so this is an expected render
  })

  it('useQuery hook sets isLoading=true only on initial request', () => {
    const User = defineComponent(() => {
      const value = ref(0)

      const { isLoading, isFetching, refetch } = api.endpoints.getUser.useQuery(
        2,
        {
          skip: computed(() => value.value < 1),
        },
      )

      return () => (
        <div>
          <div id="isLoading">{String(isLoading.value)}</div>
          <div id="isFetching">{String(isFetching.value)}</div>
          <button onClick={() => (value.value += 1)}>Increment value</button>
          <button onClick={refetch}>Refetch</button>
        </div>
      )
    })

    cy.intercept('/request', { delay: 150 }).as('request')

    mount(User, {
      global: {
        plugins: [install(store)],
      },
    })

    // Being that we skipped the initial request on mount, this should be false
    cy.get('#isLoading').should('contain', 'false')

    cy.contains('Increment value').click()
    // Condition is met, should load
    cy.get('#isLoading').should('contain', 'true')
    cy.wait('@request')
    cy.get('#isLoading').should('contain', 'false') // Make sure the original loading has completed.

    cy.contains('Increment value').click()
    // Being that we already have data, isLoading should be false
    cy.get('#isLoading').should('contain', 'false')
    // We call a refetch, should still be `false`
    cy.contains('Refetch').click()

    cy.get('#isFetching').should('contain', 'true')
    cy.wait('@request')
    cy.get('#isLoading').should('contain', 'false')
  })

  it('useQuery hook sets isLoading and isFetching to the correct states', () => {
    const User = defineComponent(() => {
      const value = ref(0)

      const { isLoading, isFetching, refetch } = api.endpoints.getUser.useQuery(
        22,
        {
          skip: computed(() => value.value < 1),
        },
      )

      useRenderCounter()

      return () => (
        <div>
          <div id="isFetching">{String(isFetching.value)}</div>
          <div id="isLoading">{String(isLoading.value)}</div>
          <button onClick={() => (value.value += 1)}>Increment value</button>
          <button onClick={refetch}>Refetch</button>
          <div id="count">{count}</div>
        </div>
      )
    })

    cy.intercept('/request', { delay: 150 }).as('request')

    mount(User, {
      global: {
        plugins: [install(store)],
      },
    })

    cy.get('#count').should('contain', '1')
    cy.get('#isLoading').should('contain', 'false')
    cy.get('#isFetching').should('contain', 'false')
    cy.contains('Increment value').click() // renders: set state = 1, perform request = 2
    // Condition is met, should load
    cy.get('#isLoading').should('contain', 'true')
    cy.get('#isFetching').should('contain', 'true')
    cy.wait('@request')

    // Make sure the request is done for sure.

    cy.get('#isLoading').should('contain', 'false')
    cy.get('#isFetching').should('contain', 'false')

    cy.get('#count').should('contain', '3')
    cy.contains('Increment value').click()
    // Being that we already have data and changing the value doesn't trigger a new request, only the button click should impact the render

    cy.get('#isLoading').should('contain', 'false')
    cy.get('#isFetching').should('contain', 'false')

    cy.get('#count').should('contain', '4')

    // We call a refetch, should set `isFetching` to true, then false when complete/errored

    cy.contains('Refetch').click()

    cy.get('#isLoading').should('contain', 'false')
    cy.get('#isFetching').should('contain', 'true')
    cy.wait('@request')
    cy.get('#isLoading').should('contain', 'false')
    cy.get('#isFetching').should('contain', 'false')

    cy.get('#count').should('contain', '6')
  })

  it('`isLoading` does not jump back to true, while `isFetching` does', () => {
    const loadingHist: boolean[] = [],
      fetchingHist: boolean[] = []

    const User = defineComponent({
      props: { id: { type: Number, required: true } },
      setup(props) {
        const { isLoading, isFetching, status } =
          api.endpoints.getUser.useQuery(computed(() => props.id))

        watchEffect(() => {
          loadingHist.push(isLoading.value)
        })

        watchEffect(() => {
          fetchingHist.push(isFetching.value)
        })

        return () => (
          <div class="status">
            {status.value === QueryStatus.fulfilled && props.id}
          </div>
        )
      },
    })

    const Render = defineComponent(() => {
      const id = ref(1)
      return () => (
        <>
          <User id={id.value}></User>

          <div onClick={() => (id.value += 1)} id="render">
            render
          </div>
        </>
      )
    })

    cy.intercept('/request', { delay: 150 }).as('request')

    mount(Render, {
      props: {
        id: 1,
      },
      global: {
        plugins: [install(store)],
      },
    })

    cy.wait('@request')
    cy.get('.status').should('contain', '1')
    cy.get('#render').click()
    cy.wait('@request')
    cy.get('.status')
      .should('contain', '2')
      .then(() => {
        expect(loadingHist).to.have.ordered.members([true, false, false, false])
        expect(fetchingHist).to.have.ordered.members([
          true,
          false,
          false,
          true,
          false,
        ])
      })
  })

  it('useQuery hook respects refetchOnMountOrArgChange: true', () => {
    const User = defineComponent(() => {
      const { data, isLoading, isFetching } =
        api.endpoints.getIncrementedAmount.useQuery(undefined, {
          refetchOnMountOrArgChange: true,
        })
      return () => (
        <div>
          <div id="isLoading">{String(isLoading.value)}</div>
          <div id="isFetching">{String(isFetching.value)}</div>
          <div id="amount">{String(data.value?.amount)}</div>
        </div>
      )
    })

    cy.intercept('/request', { delay: 1500 }).as('request')

    mount(WithRemount, {
      slots: {
        default: User,
      },
      global: {
        plugins: [install(store)],
      },
    })

    cy.get('#isLoading').should('contain', 'true')
    cy.wait('@request')
    cy.get('#isLoading').should('contain', 'false')
    cy.get('#amount').should('contain', '1')

    cy.get('#remount').click()

    // Let's make sure we actually fetch, and we increment
    cy.get('#isLoading').should('contain', 'false')
    cy.get('#isFetching').should('contain', 'true')
    cy.wait('@request')
    cy.get('#isFetching').should('contain', 'false')
    cy.get('#amount').should('contain', '2')
  })

  it('useQuery does not refetch when refetchOnMountOrArgChange: NUMBER condition is not met', () => {
    const User = defineComponent(() => {
      const { data, isLoading, isFetching } =
        api.endpoints.getIncrementedAmount.useQuery(undefined, {
          refetchOnMountOrArgChange: 10,
        })
      return () => (
        <div>
          <div id="isLoading">{String(isLoading.value)}</div>
          <div id="isFetching">{String(isFetching.value)}</div>
          <div id="amount">{String(data.value?.amount)}</div>
        </div>
      )
    })

    cy.intercept('/request', { delay: 150 }).as('request')

    mount(WithRemount, {
      slots: {
        default: User,
      },
      global: {
        plugins: [install(store)],
      },
    })

    cy.get('#isLoading').should('contain', 'true')
    cy.get('#isLoading').should('contain', 'false')
    cy.get('#amount').should('contain', '1')

    cy.get('#remount').click()
    // Let's make sure we actually fetch, and we increment. Should be false because we do this immediately
    // and the condition is set to 10 seconds
    cy.get('#isFetching').should('contain', 'false')
    cy.get('#amount').should('contain', '1')
  })

  it('useQuery refetches when refetchOnMountOrArgChange: NUMBER condition is met', () => {
    const User = defineComponent(() => {
      const { data, isLoading, isFetching } =
        api.endpoints.getIncrementedAmount.useQuery(undefined, {
          refetchOnMountOrArgChange: 0.5,
        })
      return () => (
        <div>
          <div id="isLoading">{String(isLoading.value)}</div>
          <div id="isFetching">{String(isFetching.value)}</div>
          <div id="amount">{String(data.value?.amount)}</div>
        </div>
      )
    })

    cy.intercept('/request', { delay: 150 }).as('request')

    mount(WithRemount, {
      slots: {
        default: User,
      },
      global: {
        plugins: [install(store)],
      },
    })

    cy.get('#isLoading').should('contain', 'true')
    cy.get('#isLoading').should('contain', 'false')
    cy.get('#amount').should('contain', '1')

    cy.wait(510)

    cy.get('#remount').click()
    // Let's make sure we actually fetch, and we increment
    cy.get('#isFetching').should('contain', 'true')
    cy.get('#isFetching').should('contain', 'false')
    cy.get('#amount').should('contain', '2')
  })

  it('refetchOnMountOrArgChange works as expected when changing skip from false->true', () => {
    const User = defineComponent(() => {
      const skip = ref(true)
      const { data, isLoading, isFetching } =
        api.endpoints.getIncrementedAmount.useQuery(undefined, {
          refetchOnMountOrArgChange: 0.5,
          skip,
        })

      return () => (
        <div>
          <div id="isLoading">{String(isLoading.value)}</div>
          <div id="isFetching">{String(isFetching.value)}</div>
          <div id="amount">{String(data.value?.amount)}</div>
          <button onClick={() => (skip.value = !skip.value)}>
            change skip
          </button>
        </div>
      )
    })

    cy.intercept('/request', {
      delay: 150,
    }).as('request')

    mount(User, {
      global: {
        plugins: [install(store)],
      },
    })

    cy.get('#isLoading').should('contain', 'false')
    cy.get('#amount').should('contain', 'undefined')
    cy.contains('change skip').click()
    cy.get('#isFetching').should('contain', 'true')
    cy.wait('@request')
    cy.get('#isFetching').should('contain', 'false')
    cy.get('#amount').should('contain', '1')
  })

  it('refetchOnMountOrArgChange works as expected when changing skip from false->true with a cached query', () => {
    // 1. we need to mount a skipped query, then toggle skip to generate a cached result
    // 2. we need to mount a skipped component after that, then toggle skip as well. should pull from the cache.
    // 3. we need to mount another skipped component, then toggle skip after the specified duration and expect the time condition to be satisfied

    const User = defineComponent(() => {
      const skip = ref(true)
      const { data, isLoading, isFetching } =
        api.endpoints.getIncrementedAmount.useQuery(undefined, {
          skip,
          refetchOnMountOrArgChange: 0.5,
        })

      return () => (
        <div>
          <div id="isLoading">{String(isLoading.value)}</div>
          <div id="isFetching">{String(isFetching.value)}</div>
          <div id="amount">{String(data.value?.amount)}</div>
          <button onClick={() => (skip.value = !skip.value)}>
            change skip
          </button>
          ;
        </div>
      )
    })

    cy.intercept('/request', {
      delay: 150,
    }).as('request')

    mount(WithRemount, {
      slots: {
        default: User,
      },
      global: {
        plugins: [install(store)],
      },
    })

    cy.get('#isFetching').should('contain', 'false')

    // skipped queries do nothing by default, so we need to toggle that to get a cached result
    cy.contains('change skip').click()
    cy.get('#isFetching').should('contain', 'true')
    cy.wait('@request')
    cy.get('#amount').should('contain', '1')
    cy.get('#isFetching').should('contain', 'false')

    cy.wait(100)

    // This will pull from the cache as the time criteria is not met.
    cy.get('#remount').click()

    // skipped queries return nothing
    cy.get('#isFetching').should('contain', 'false')
    cy.get('#amount').should('contain', 'undefined')

    // toggle skip -> true... won't refetch as the time critera is not met, and just loads the cached values
    cy.contains('change skip').click()
    cy.get('#isFetching').should('contain', 'false')
    cy.get('#amount').should('contain', '1')

    cy.wait(500)

    cy.get('#remount').click()

    // toggle skip -> true... will cause a refetch as the time criteria is now satisfied
    cy.contains('change skip').click()
    cy.get('#isFetching').should('contain', 'true')
    cy.wait('@request')
    cy.get('#isFetching').should('contain', 'false')
    cy.get('#amount').should('contain', '2')
  })
})
