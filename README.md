# vue-redux-hooks [![CircleCI](https://circleci.com/gh/PatrykWalach/vue-redux-hooks.svg?style=svg)](https://circleci.com/gh/PatrykWalach/vue-redux-hooks) [![codecov](https://codecov.io/gh/PatrykWalach/vue-redux-hooks/branch/master/graph/badge.svg)](https://codecov.io/gh/PatrykWalach/vue-redux-hooks) ![](https://img.shields.io/npm/v/vue-redux-hooks)

## Table of Contents

- [Install](#install)
- [API](#api)
  - [Default](#default)
  - [Hooks](#hooks)
    - [useStore](#useStore)
    - [useDispatch](#useDispatch)
    - [useSelector](#useSelector)

## Install

Make sure you've installed:
[redux](https://github.com/reduxjs/redux), [vue](https://github.com/vuejs/vue), [@vue/composition-api](https://github.com/vuejs/composition-api).

```sh
npm i vue-redux-hooks
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
export type State = ReturnType<Store['getState']>
export type AppDispatch = Store['dispatch']
```

### Hooks

#### `useStore`

```typescript
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

#### `useDispatch`

```tsx
import { useDispatch } from 'vue-redux-hooks'

export default {
  setup() {
    const dispatch = useDispatch<AppDispatch>()

    const ADD_TODO = (text: string) =>
      dispatch({
        type: 'ADD_TODO',
        text,
      })

    return { ADD_TODO }
  },
}
```
