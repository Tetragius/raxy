![logo](logo.png?raw=true "logo")

[![Build Status](https://travis-ci.org/Tetragius/raxy.svg?branch=master)](https://travis-ci.org/Tetragius/raxy) [![npm version](https://badge.fury.io/js/raxy.svg)](https://badge.fury.io/js/raxy) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Raxy (ReAct + ProXY)

Simple react state manager. You can work with state as with a regular object.
Can be used with redux-devtools-extension and history. Also works with react hooks.

Powered by Proxy API. It is possible to dynamically create wrappers (page-two in the example) for rendering optimization or using react hooks.

__~2kb__ or __~5kb__ with plyfill for IE

[DEMO](https://codesandbox.io/s/raxy-demo-3mur7)

```typescript
const initalState = { message: 'Hello' };
const { subscribe, store } = raxy(initalState); 

subscribe('update', (event) => console.log(event.detail.store)) // output: {message: 'Hellow Raxy'}

store.message = "Hellow raxy"; // update state;
```

Based on JS Proxy API and works with all browsers that support it. Also IE 10+ because has polyfill.

![Chrome](https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png) | ![Firefox](https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png) | ![IE](https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png) | ![Opera](https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png) | ![Safari](https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png)
--- | --- | --- | --- | --- |
49+ ✔ | 18+ ✔ | IE 10+ (Edge)18+ ✔ | 36+ ✔ | 10+ ✔ |

---
Navigation
- [Installation](#installation)
- [Simple usage](#simple-usage)
- [Transactions](#transactions)
- [Dev-tools example](#dev-tools-example)
- [API](#api)


## Installation

```sh
npm install --save @tetragius/raxy
```

## Simple usage

```javascript
import { raxy } from '@tetragius/raxy'; // with polyfill
import { raxy } from '@tetragius/raxy/next'; // without polyfill
```

#### Create store

```javascript
// store.js
import { raxy } from '@tetragius/raxy';
// import { raxyReact } from '@tetragius/raxy'; -> for better typescript with react

// initial app state
const initStore = { message: 'Hello' }

// create new store
export const instanse = raxy(initStore); // or raxyReact(initStore)
// instanse = {store, transaction, subscribe, unsubscribe}

// instanse = {store, transaction, subscribe, unsubscribe, useRaxy} for raxyReact
// export const {store, transaction, subscribe, unsubscribe, useRaxy} = instanse; for export useRaxy
```

#### Usage in react

```javascript
// component.jsx
import React from 'react';
import { Raxy, useRaxy } from '@tetragius/raxy';
// import { useRaxy } from './store' if you use raxyReact
import { instanse } from './store';

function Component() {
  const { state } = useRaxy((state: any) => ({ // return {state, store, transaction}
    message: state.message,
  }));

  return <div>{state.message}</div>;
}

export default function App() {
  return (
    <Raxy value={instanse}>
      <Component />
    </Raxy>
  );
}
```

#### Transactions

You can create transaction for combine multiple operations at one.

```javascript
const initalState = { 
    a: 1,
    b: 2, 
    array: [1, 2, 3, 4],
    nested: { c: 3, nested: { d: 4 } }, 
};

const { transaction, store, subscribe } = raxy(initalState); 

subscribe("update", console.log);
subscribe("transactionstart", console.log);
subscribe("transactionend", console.log);

transaction("transaction name", (store) => {
    store.array.push(5);
    store.a = 2;
    store.nested.c = 4;
    return true; // if false transaction will rollback
});
```

## API

#### raxy

```javascript
raxy(initState)
```

return object with fields
- store - store for update and other operations
- transaction - method for create bulk operations
- subscribe - subscribe to store change (on `update`, `transactionstart`, `transactionend`)
- unsubscribe - subscribe from store change

#### raxyReact

```javascript
raxyReact(initState)
```

return object with fields
- store - store for update and other operations
- transaction - method for create bulk operations
- subscribe - subscribe to store change (on `update`, `transactionstart`, `transactionend`)
- unsubscribe - subscribe from store change
- useRaxy - useRaxy + typescript support for store;

#### transaction

```typescript
transaction<Store>(name: string, async (store: Store)) => boolean
```

create bulk operation, you can chain transaction by use `then`. If transaction return false it well rollback;

#### subscribe/unsobscribe

```typescript
export interface IDetail<S> {
    name?: string;
    complete?: string;
    store: S;
}
subscribe(on: 'update'|'transactionstart'|'transactionend', (event: CustomEvent<IDetail>) => void)
```

subscribe to store changes. event has field `detail` with typeof `IDetail`

#### useRaxy

```typescript
type Filter<Store = typeof context, State = any> = (sotre: Store) => State;

useRaxy<Store, State>(filter: Filter<Store, State>): { state: State, store: Store, transaction: Transaction<Store> }
```

hook for react - rerender component when store is updated