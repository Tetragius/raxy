[![npm version](https://badge.fury.io/js/%40tetragius%2Fraxy-react.svg)](https://badge.fury.io/js/%40tetragius%2Fraxy-react)

[Main](https://github.com/Tetragius/raxy)

# Demo
  - [DEMO: Todo list](https://codesandbox.io/s/raxy-demo-3mur7)
  - [DEMO: Todo list - complex](https://codesandbox.io/s/raxy-demo-complex-5syo0)
  - [DEMO: Todo list - long](https://codesandbox.io/s/raxy-demo-longlist-cl837)


# API

## Raxy

```tsx
import React from "react";
import { Raxy } from "@tetragius/raxy-react";
import instanse from "./store"; // экземпляр IRaxy

export default function App() {
  return (
    <Raxy value={instanse}>
      {...}
    </Raxy>
  );
}
```

Provider for using the `useRaxy` hook

## useRaxy

```typescript
type Filter<Store = typeof context, State = any> = (sotre: Store) => State;

useRaxy<Store, State>(filter: Filter<Store, State>, options?): { state: State, store: Store, transaction: Transaction<Store> }
```

Creates a connection to the repository

- `filter` - a function that determines when changing which parts of the storage to call the component redrawing
- `options` - a set of options to optimize work

```typescript
type Options<State = any> = {
    [P in keyof State]?: {
        ignoreTimeStamp?: boolean;
    };
};
interface IConnectorOptions<T = any> {
    elementRef?: React.RefObj<T>;
}
```

Пример опций

```typescript
useRaxy(
    (store) => ({
      todos: store.todos, /
      length: store.todos.length 
    }),
    {
      todos: { ignoreTimeStamp: true } // render does not take into account changes in the state of child elements
      elementRef: element // reference to the DOM node to optimize the updateCallback call
    }
  );
```

When `elementRef` is specified, it automatically disables checking the storage state change if the specified element is not visible on the page or in any viewport.

The `connect` method returns an object with fields

- `state` - reference to the state returned by the `filter` method
- `store` - link to `store`
- `transaction` - a method for making transactions

## raxyReact

```typescript
interface IRaxyWithHook<S> extends IRaxy<S> {
    useRaxy: Hook<S>;
}
raxyReact: <Store = any>(initStore: Store) => IRaxyWithHook<Store>;
```
Creates a typed instance of the `useRaxy` function can be used instead of calling `raxy`
