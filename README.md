# vue-redux-hooks [![CircleCI](https://circleci.com/gh/PatrykWalach/vue-redux-hooks.svg?style=svg)](https://circleci.com/gh/PatrykWalach/vue-redux-hooks) [![codecov](https://codecov.io/gh/PatrykWalach/vue-redux-hooks/branch/master/graph/badge.svg)](https://codecov.io/gh/PatrykWalach/vue-redux-hooks) [![](https://img.shields.io/npm/v/vue-redux-hooks)](https://www.npmjs.com/package/vue-redux-hooks) [![](https://img.shields.io/bundlephobia/minzip/vue-redux-hooks)](https://bundlephobia.com/result?p=vue-redux-hooks) ![](https://img.shields.io/npm/dependency-version/vue-redux-hooks/peer/vue) ![](https://img.shields.io/npm/dependency-version/vue-redux-hooks/peer/redux)

## Table of Contents

- [Install](#install)
- [API](#api)
  - [ReduxStore](#ReduxStore)
  - [Hooks](#hooks)
    - [useStore](#useStore)
    - [useDispatch](#useDispatch)
    - [useSelector](#useSelector)

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

#### `useDispatch`

```tsx
import { useDispatch } from 'vue-redux-hooks'

export default {
  setup() {
    const dispatch = useDispatch<Store>()

    const addTodo = (text: string) =>
      dispatch({
        type: 'ADD_TODO',
        text,
      })

    return { addTodo }
  },
}
```
