![logo](logo.png?raw=true "logo")

[![Build Status](https://travis-ci.org/Tetragius/raxy.svg?branch=master)](https://travis-ci.org/Tetragius/raxy) [![npm version](https://badge.fury.io/js/raxy.svg)](https://badge.fury.io/js/raxy) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Raxy (ReAct + ProXY)

Simple react state manager. You can work with state as with a regular object.
Can be used with redux-devtools-extension and history.

[DEMO](https://tetragius.github.io/raxy/example/dist/#/)

```typescript
const initalState = {any: 1};
const {state, connect, subscribe} = Raxy<IState>(initalState); 

/* IState */ state.any = 5; // update state;

connect<IComponentProps>(Component: ComponentClass, mapper(state: IState):IComponentProps)

subscribe<IProps>(callback(props: IProps), mapper(state: IState):IProps)

```

Based on JS Proxy API and works with all browsers that support it. Also IE 10+ because has polyfill.

![Chrome](https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png) | ![Firefox](https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png) | ![IE](https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png) | ![Opera](https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png) | ![Safari](https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png)
--- | --- | --- | --- | --- |
49+ ✔ | 18+ ✔ | IE 10+ (Edge)18+ ✔ | 36+ ✔ | 10+ ✔ |

---
Navigation
- [Installation](#installation)
- [API description](#api-description)
- [Simple usage](#simple-usage)
- [Additional](#additional)
- [Updates & side-effects](#updates-side-effects)
- [Actions (optional)](#actions-optional)
- [Subscribes](#subscribes)
- [Dev-tools & history examples](#dev-tools-history-examples)




## Installation

```sh
npm install --save raxy
```

## API description

To create a new store call:
```javascript
new Raxy({initialState});
```
this returns two methods and proxied state

#### Methods

__connect the react component to the store:__
```javascript
connect(Component, mapper);
```

__component__ - reactant component

__mapper__ - map store to component props
___

__connect listener to the store:__
```javascript
subscribe(callback, mapper);
```
__callback__ - function with an argument containing the value returned by the _mapper_

__mapper__ - map store for _callback_

retrun object with _off_ and _on_ methids;

#### Poxied state
```javascript
state
// you can chage this just chage object properties
```

---

## Simple usage

#### Create store

```javascript
// store.js
import Raxy from 'raxy';

// initial app state

const ToDo = {
    list: [
        {title: 'item 1', finished: false},
        {title: 'item 2', finished: false},
        {title: 'item 3', finished: false},
    ]
}

// create new store
export const {state, connect} = new Raxy(ToDo);
```

#### Usage in react

```javascript
// component.jsx
import React from 'react';
import { connect, state } from './store';

class Component extends React.Component {
    constructor(props){
        super(props);
    }

    click = () => {
        // update store
        state.list = state.list.map(i => {
            if(i === this.props.item){
                i.finished = !i.finished;
            }
            return i;
        });
    }

    render(){

        const list = this.props.list;

        return (
            <div>
                {
                    list && list.map((item, idx) => {
                        return <div key={idx} onClick={() => this.click(item)}>
                            {item.title} - {JSON.stringify(item.finished)}
                        </div>
                    });
                }
            </div>);
    }
}

// connect to store
export ConnectedComponent = connect(Component, store => ({list: store.list}));
```

---

## Additional

#### Store can be more complicated

```javascript
const ToDo = {
    list: [
        {title: 'item 1', finished: false},
        {title: 'item 2', finished: false},
        {title: 'item 3', finished: false},
    ]
}

const AnotherToDo = {
    list: [
        {title: 'item 1', finished: false},
        {title: 'item 2', finished: false},
        {title: 'item 3', finished: false},
    ]
}

const Another = {
    ObjectA: {
        a: 1,
        b: 2
    },
    ObjectB: {
        a: 1,
        b: 2
    }
}

// create new store
export const {state, connect} = new Raxy({ToDo, AnotherToDo, Another});
```

#### Updates & side-effects
```javascript
    // you can update store like
    state.Another.ObjectA.a = 3;
    state.Another.ObjectA = {
        a: 3,
        b: 4,
        c: 5
    }
    state.ToDo.list = [...state.ToDo.list, {title: 'item 4', finished: false}];

    // you can connect like
    connect(Component, store => ({list: store.ToDo.list}));
    connect(Component, store => ({countFinished: store.ToDo.list.filter(i => i.finished).length}));
    connect(Component, store => ({b: store.Another.ObjectA.b}));
```

#### Actions (optional)

You can create actions for combine multiple operations at one.

```javascript
const store = new Raxy({ 
    a: 1, b: 2, 
    nested: { c: 3, nested: { d: 4 } }, 
    nestedAgain: { e: 5 } });

store.subscribe((s) => expect(s).to.equal(3), state => ({ d:state.nested.nested.d }));

const action = (c, e) => {
    const state = Object.assign({}, store.state);
    state.nested.c = c;
    state.nestedAgain.e = e;
    Object.assign(store.state, state);
}

action(4, 5);
```

## Subscribes

```javascript
const {state, connect, /*!!*/ subscribe /*!!*/} = new Raxy({ToDo, AnotherToDo, Another});

subscribe((state) => console.log(state), s => ({...s})); // example

// or
// const subscriber = subscribe((state) => console.log(state), s => ({...s}));
// subscriber.off() - stop listen;
// subscriber.on() - start again;
```

## Dev-tools & history examples

```javascript
const history = createHashHistory({ basename: '/' });

const {state, subscribe} = new Raxy({
    list: [
        { label: 'item 1', status: false },
        { label: 'item 2', status: false },
        { label: 'item 3', status: true },
    ],
    /*!!*/ location: history.location, /*!!*/
    nested: { b: 2 }
});

state.subscribe(location => console.log(location), state => ({ location: state.location }));

history.listen(location => state.location = location);
```

```javascript
const {state, subscribe} = new Raxy({});

const devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect();

devTools.init({ value: state });

subscribe(state => devTools.send('change state', { value: state }), state => ({ ...state }));
```