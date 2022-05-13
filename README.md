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

// after augmenting ComponentCustomProperties all other typings are not required
declare module 'vue' {
  interface ComponentCustomProperties {
    $redux: { store: typeof store; state: ReturnType<typeof store.getState> }
  }
}
```

```typescript
// main.ts
import { createApp } from 'vue'
import { install } from 'vue-redux-hooks'
import { store } from './store'

createApp(App).use(install(store)).mount('#app')
```

### Options

## `mapState`

```ts
// App.vue
import { mapState } from 'vue-redux-hooks'

export default {
  data() {
    return {
      search: 'Today',
    }
  },
  computed: {
    ...mapState({
      filteredTodos(this: { search: string }, todos: State) {
        return todos.filter((todo) => todo.includes(this.search))
      },
    }),
    // or
    filteredTodos() {
      return this.$reduxState.filter((todo) => todo.includes(this.search))
    },
  },
}
```

## `mapDispatch`

```ts
// App.vue
import { mapDispatch } from 'vue-redux-hooks'

export default {
  methods: {
    ...mapDispatch({
      addTodo: (dispatch: Dispatch, text: string) =>
        dispatch({
          type: 'ADD_TODO',
          text,
        }),
    }),
    // or
    addTodo(text: string) {
      return this.$store.dispatch({
        type: 'ADD_TODO',
        text,
      })
    },
  },
}
```

### Hooks

#### `useStore`

```ts
// App.vue
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
// App.vue
import { useSelector } from 'vue-redux-hooks'

export default {
  setup() {
    const search = ref('Today')

    const filteredTodos = useSelector((todos: State) =>
      todos.filter((todo) => todo.includes(search.value)),
    )

    return { filteredTodos }
  },
}
```

#### `useDispatch`

```ts
// App.vue
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

    return { name, skip, ...query }
  },
}
```
