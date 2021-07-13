# vue-redux-hooks [![CircleCI](https://circleci.com/gh/PatrykWalach/vue-redux-hooks.svg?style=svg)](https://circleci.com/gh/PatrykWalach/vue-redux-hooks) [![codecov](https://codecov.io/gh/PatrykWalach/vue-redux-hooks/branch/master/graph/badge.svg)](https://codecov.io/gh/PatrykWalach/vue-redux-hooks) [![](https://img.shields.io/npm/v/vue-redux-hooks)](https://www.npmjs.com/package/vue-redux-hooks) [![](https://img.shields.io/bundlephobia/minzip/vue-redux-hooks)](https://bundlephobia.com/result?p=vue-redux-hooks) ![](https://img.shields.io/npm/dependency-version/vue-redux-hooks/peer/vue) ![](https://img.shields.io/npm/dependency-version/vue-redux-hooks/peer/redux)

## Install

```sh
npm i redux vue-redux-hooks
```

```sh
yarn add redux vue-redux-hooks
```

## API

### `ReduxStore`

```typescript
// store.ts
import { createStore, AnyAction } from 'redux'

function todos(state: string[] = [], action: AnyAction) {
  switch (action.type) {
    case 'ADD_TODO':
      return state.concat([action.text])
    default:
      return state
  }
}

export const store = createStore(todos, ['Use Redux'])

export type Store = typeof store
export type State = ReturnType<typeof todos>
export type Dispatch = typeof store.dispatch
```

```typescript
// main.ts
import { createApp } from 'vue'
import { ReduxStore } from 'vue-redux-hooks'
import { store } from './store'

createApp(App).provide(ReduxStore, store).mount('#app')
```

### Hooks

#### `useStore`

```ts
// api.ts
import { useStore } from 'vue-redux-hooks'

export default {
  setup() {
    const store = useStore<Store>()

    const initialState = store.getState()

    return { initialState }
  },
}
```

#### `useSelector`

```ts
// api.ts
import { useSelector } from 'vue-redux-hooks'

export default {
  setup() {
    const todos = useSelector((state: State) => state)

    const todosLength = useSelector((state: State) => state.length)

    const lastTodo = computed(() => todos.value[todosLength.value - 1])

    return { todos, lastTodo }
  },
}
```

#### `useDispatch`

```ts
// api.ts
import { useDispatch } from 'vue-redux-hooks'

export default {
  setup() {
    const dispatch = useDispatch<Dispatch>()

    const addTodo = (text: string) =>
      dispatch({
        type: 'ADD_TODO',
        text,
      })

    return { addTodo }
  },
}
```

### RTK Query

### `createApi`

```ts
// pokemonApi.ts
// Need to use the Vue-specific entry point to allow generating Vue hooks
import { createApi } from 'vue-redux-hooks'
import { fetchBaseQuery } from '@reduxjs/toolkit/query'
import type { Pokemon } from './types'

// Define a service using a base URL and expected endpoints
export const pokemonApi = createApi({
  reducerPath: 'pokemonApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://pokeapi.co/api/v2/' }),
  endpoints: (builder) => ({
    getPokemonByName: builder.query<Pokemon, string>({
      query: (name) => `pokemon/${name}`,
    }),
  }),
})

// Export hooks for usage in function components, which are
// auto-generated based on the defined endpoints
export const { useGetPokemonByNameQuery } = pokemonApi
```

```ts
// App.vue
import { toRefs, ref } from 'vue'
import { useGetPokemonByNameQuery } from './pokemonApi'

export default {
  setup() {
    const name = ref('Pikachu')

    const skip = ref(false)

    const query = useGetPokemonByNameQuery(name, {
      refetchOnReconnect: true,
      skip,
    })

    return { name, skip, ...toRefs(query) }
  },
}
```
