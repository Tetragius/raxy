[![Build Status](https://travis-ci.org/Tetragius/raxy.svg?branch=master)](https://travis-ci.org/Tetragius/raxy) [![npm version](https://badge.fury.io/js/%40tetragius%2Fraxy.svg)](https://badge.fury.io/js/%40tetragius%2Fraxy) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

![Chrome](https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png) | ![Firefox](https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png) | ![IE](https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png) | ![Opera](https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png) | ![Opera](https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png) |
--- | --- | --- | --- | --- |
49+ ✔ | 18+ ✔ | 18+ ✔ | 36+ ✔ | 10+ ✔ | 

# Raxy

A simple state manager to implement the [SSOT](https://en.wikipedia.org/wiki/Single_source_of_truth) approach , can be used with [React](https://reactjs.org/) or [Vue](https://vuejs.org/)

Works on the basis of the Proxy API in all browsers that support it.

Can work in **IE** using polyfills for `Proxy`, `Promise`, `CustomEvent`, `Symbol` and `IntersectionObserver`
 
The main difference from most state managers is to work with the storage as with an ordinary object, without using complex event mechanisms and selectors.

Supports debugging with [`Redux dev-tools`](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=ru)

---
Table of contents::
- [Installation](#installation)
- [Demo](#demo)
- [API](#api)
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

## transaction

```typescript
transaction<Store>(name: string, async (store: Store)) => boolean
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

Additional fields are specified for `transactionstart` and `transactionend`:
- `name` - the name of the transaction
- `complete` - transaction status ( `true` - completed)

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
      todos: { ignoreTimeStamp: true } // рендер не учитывает изменения состояния дочерних элеиентов
      elementRef: element // ссылка на DOM ноду для оптимизации вызова updateCallback
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

Displays the event log `update`, `transactionstart`, `transactionend` to the console;

## connectDevTools

```typescript
connectDevTools: (instanse: IRaxy<any>) => void;
```

Enables support for [`Redux dev-tools`](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=ru)
