![logo](logo.png?raw=true "logo")

[![Build Status](https://travis-ci.org/Tetragius/raxy.svg?branch=master)](https://travis-ci.org/Tetragius/raxy) [![npm version](https://badge.fury.io/js/raxy.svg)](https://badge.fury.io/js/raxy) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Raxy (ReAct + ProXY)

Simple react state manager. You can work with state as with a regular object.
Can be used with redux-devtools-extension and history. Also works with react hooks.

Powered by Proxy API. It is possible to dynamically create wrappers (page-two in the example) for rendering optimization or using react hooks.

__~2kb__ or __~5kb__ with plyfill for IE

[DEMO](https://tetragius.github.io/raxy/example/dist/#/)

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


## Installation

```sh
npm install --save raxy
```

## Simple usage

```javascript
import { raxy } from 'raxy'; // with polyfill
import { raxy } from 'raxy/next'; // without polyfill
```

#### Create store

```javascript
// store.js
import { raxy } from 'raxy';

// initial app state
const initStore = { message: 'Hello' }

// create new store
export const instanse = raxy(initStore);
```

#### Usage in react

```javascript
// component.jsx
import React from 'react';
import { Raxy, useRaxy } from 'raxy';
import { instanse } from './store';

function Component() {
  const state = useRaxy((state: any) => ({
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
const initalState = new Raxy({ 
    a: 1,
    b: 2, 
    array: [1, 2, 3, 4],
    nested: { c: 3, nested: { d: 4 } }, 
});

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

## Dev-tools example

```javascript
const devTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__.connect();

export const { store, subscribe } = new Raxy(initialState);

subscribe("transactionend", (event) => {
    devTools && devTools.send(event.detail.name, { value: { ...event.detail.store } });
});

devTools && devTools.init({ value: store });
```