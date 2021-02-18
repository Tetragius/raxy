[![Build Status](https://travis-ci.org/Tetragius/raxy.svg?branch=master)](https://travis-ci.org/Tetragius/raxy) [![npm version](https://badge.fury.io/js/%40tetragius%2Fraxy.svg)](https://badge.fury.io/js/%40tetragius%2Fraxy) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

![Chrome](https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png) | ![Firefox](https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png) | ![IE](https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png) | ![Opera](https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png) | ![Opera](https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png) |
--- | --- | --- | --- | --- |
49+ ✔ | 18+ ✔ | 18+ ✔ | 36+ ✔ | 10+ ✔ | 

Can work in **IE** using polyfill [`@tetragius/raxy-polyfill`](https://github.com/Tetragius/raxy/tree/master/packages/raxy-polyfill)

# Raxy

![Flow](/flow.png)

A simple state manager to implement the [SSOT](https://en.wikipedia.org/wiki/Single_source_of_truth) approach , can be used with [React](https://reactjs.org/) or [Vue](https://vuejs.org/)

Works on the basis of the Proxy API in all browsers that support it.

The main difference from most state managers is to work with the storage as with an ordinary object, without using complex event mechanisms and selectors.

Supports debugging with [`Redux dev-tools`](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=ru)

---
Table of contents::
- [Installation](#installation)
- [Demo](#demo)
- [API](#api)
- [Polyfill](#polyfill)
- Frameworks
  - [React](https://github.com/Tetragius/raxy/tree/master/packages/raxy-react)
  - [Vue](https://github.com/Tetragius/raxy/tree/master/packages/raxy-vue)


# Installation

```sh
npm install --save @tetragius/raxy
```

## For React

```sh
npm install --save @tetragius/raxy-react
```

## For Vue

```sh
npm install --save @tetragius/raxy @tetragius/raxy-vue
```

# Demo

- React
  - [DEMO: Todo list](https://codesandbox.io/s/raxy-demo-3mur7)
  - [DEMO: Todo list - complex](https://codesandbox.io/s/raxy-demo-complex-5syo0)
  - [DEMO: Todo list - long](https://codesandbox.io/s/raxy-demo-longlist-cl837)
  - [DEMO: Arkanoid](https://codesandbox.io/s/raxy-demo-arkanoid-kwrfm)
- Vue
  - [DEMO](https://codesandbox.io/s/raxy-vue-example-e74vn)
  - [DEMO: TODO list](https://codesandbox.io/s/raxy-vue-example-xsrtu)


# API

## raxy

```javascript
raxy(initState)
```

Returns an object with fields:
- `store` - proxied store
- `transaction` - method for conducting transactions
- `subscribe` - method for subscribing to store change events (`update`, `transactionstart`, `transactionend`)
- `unsubscribe` - method for unsubscribing storage update events
- `transactions` - transaction queue

Each transaction in the `queue` has an abort method that aborts the current transaction and moves on to the next.

## transaction

```typescript
transaction<Store>(name: string, async (store: Store, progress: (n: number) => void))) => boolean
```

Creates a transaction to change several values ​​of the storage, if the transaction is not successful (if the function returns `false`) - all actions will be canceled.

Transactions are queued and executed strictly in the order they are called.

Transactions are `Promise` functions and can be chained.

```typescript
transaction('transaction A', updater_A).then(transaction('transaction B', updater_B));

// или

await transaction('transaction A', updater_A);
await transaction('transaction B', updater_B);
```

A successful transaction returns - `true`.

The name of the transaction is for informational purposes only and can be chosen at the discretion of the developer.

The `progress` method - takes a number and sets the progress, also raises the `transactionprogress` event

The `progress` method contains:
 - field `progress.target` with type `ITransaction`
 - field `progress.prev` of type `ITransaction` - result of the previous transaction

```typescript
interface ITransaction <S> {
    name: string; // transaction name
    pending: logical; // execution status
    interrupted?: any; // reason for abort
    progress: number; // execution stage
    rollback: rollback []; // array of inverse operations
    the shops; // link to storage
    updater: Updater <S>; // storage update method
    solve?: Resolver <S> // array of inverse operations
    abort: Abort; // method for completing the transaction - starts the rollback
}
```

## subscribe/unsubscribe

```typescript
export interface IDetail<S> {
    name?: string;
    complete?: string;
    store: S;
}
subscribe(on: 'update'|'transactionstart'|'transactionend', (event: CustomEvent<IDetail>) => void)
```

Subscribes to or unsubscribes from a repository update.

The `event` object contains the `detail` field of the `IDetail` interface.

- `update` - Any update to the repository.
- `transactionstart` - Transaction started.
- `transactionend` - Transaction completed.
- `addtransaction` - Transaction added to the queue
- `transactionaborted` - Transaction canceled
- `transactionprogress` - Transaction progress
- `connected`- A new object is connected to the storage

Additional fields are specified for `transactionstart` and` transactionend`:
- `name` - the name of the transaction
- `complete` - transaction status (` true` - completed)

Additional fields are specified for `transactionaborted`:
- `aborted` - {status: any} - an object describing the reason for the cancellation

Additional fields are specified for `transactionaborted`:
- `progress` - Percentage of progress, set by the user - type `number`

Additional fields are specified for `connected`:
- `value` - Link to the new connected storage

## connect

```typescript
connect: <Store = any, State = any>(instanse: IRaxy<Store>, updateCallback: (state: State) => void, filter?: Filter<Store, State>, options?: IConnectorOptions<any> & Options<State>) => IConnector<Store, State>;

type Connector<S> = <State = any>(updateCallback: (state: State) => void, filter?: Filter<S, State>, options?: IConnectorOptions & Options<State>) => IConnector<S, State>;
```

Creates a connection to the repository

- `instanse` - an instance created by calling the `raxy` method
- `updateCallback` - a function that will be called every time the state changes
- `filter` - a function that determines when changing which parts of the storage to call `updateCallback`
- `options` - a set of options to optimize work

```typescript
type Options<State = any> = {
    [P in keyof State]?: {
        ignoreTimeStamp?: boolean;
    };
};
interface IConnectorOptions<T = any> {
    elementRef?: RefObj<T>;
}
```

Пример опций

```typescript
connect(
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
- `mountCallback` - the method that should be called to enable the subscription
- `unmountCallback` - the method that should be called to disable the subscription

## createConnector

```typescript
createConnector: <Store = any>(initStore: Store) => IRaxyWithConnector<Store>;

interface IRaxyWithConnector<S> extends IRaxy<S> {
    connect: Connector<S>;
}
```

Creates a typed instance of the `connect` function can be used instead of calling `raxy`

## logger

```typescript
logger: (subscribe: IRaxy<any>['subscribe']) => void;
```

Displays the event log `update`, `transactionstart`, `transactionend`, `addtransaction`, `transactionaborted`, `transactionprogress`, `connected` to the console;

## connectDevTools

```typescript
connectDevTools: (instanse: IRaxy<any>) => void;
```

Enables support for [`Redux dev-tools`](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=ru)


## Polyfill

```typescript
// Add to the beginning of the first file in the assembly
import "@babel/polyfill";
import '@tetragius/raxy-polyfill';
```

IE has some limitations
- Mutations do not work correctly - changes must be immutable
- It is necessary to subscribe to the property being changed, since the subscription to the object does not work