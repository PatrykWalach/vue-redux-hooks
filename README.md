# vue-redux-hooks [![CircleCI](https://circleci.com/gh/PatrykWalach/vue-redux-hooks.svg?style=svg)](https://circleci.com/gh/PatrykWalach/vue-redux-hooks) [![codecov](https://codecov.io/gh/PatrykWalach/vue-redux-hooks/branch/master/graph/badge.svg)](https://codecov.io/gh/PatrykWalach/vue-redux-hooks) ![](https://img.shields.io/npm/v/vue-redux-hooks)

g

## Table of Contents

- [Install](#install)
- [API](#api)
  - [Default](#default)
  - [Hooks](#hooks)
    - [useStore](#useStore)
    - [useDispatch](#useDispatch)
    - [useSelector](#useSelector)

## Install

### Vue 3

```sh
npm i redux vue-redux-hooks
```

### Vue 2

```sh
npm i redux vue-redux-hooks@0 @vue/composition-api
```

## API

### `default`

```typescript
import VueReduxHooks from 'vue-redux-hooks'
import { createStore } from 'redux'

const todos = (state = [], action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return state.concat([action.text])
    default:
      return state
  }
}

const store = createStore(todos, ['Use Redux'])

Vue.use(VueReduxHooks, store)

export type Store = typeof store
export type State = ReturnType<typeof todos>
```

### Hooks

#### `useStore`

```tsx
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

```tsx
import { useSelector } from 'vue-redux-hooks'

export default {
  setup() {
    const todos = useSelector((state: State) => state)

    const todosLength = useSelector((state: State) => state.length)

    const lastTodo = computed(() => todos.value[todosLength.value])

    return { todos, lastTodo }
  },
}
```

You can provide an equality function. In the example below todos will update only if it's length changes

```tsx
const todos = useSelector(
  (state: string[]) => state,
  (nextState, prevState) => nextState.length === prevState.length,
)
```

#### `useDispatch`

```tsx
import { useDispatch } from 'vue-redux-hooks'

export default {
  setup() {
    const dispatch = useDispatch<Store>()

    const ADD_TODO = (text: string) =>
      dispatch({
        type: 'ADD_TODO',
        text,
      })

    return { ADD_TODO }
  },
}
```
