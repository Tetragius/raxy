![logo](logo.png?raw=true "logo")

[![Build Status](https://travis-ci.org/Tetragius/raxy.svg?branch=master)](https://travis-ci.org/Tetragius/raxy) [![npm version](https://badge.fury.io/js/raxy.svg)](https://badge.fury.io/js/raxy) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Raxy (ReAct + ProXY)

Simple react state manager. You can work with state as with a regular object.
Can be used with redux-devtools-extension and history. Also works with react hooks.

Powered by Proxy API. It is possible to dynamically create wrappers (page-two in the example) for rendering optimization or using react hooks.

__~2kb__ or __~5kb__ with plyfill for IE

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
- [Complex store](#store-can-be-more-complicated)
- [Arrays](#also-you-can-subscribe-or-update-item-in-arrays)
- [Updates & side-effects](#updates-side-effects)
- [Dynamic connect](#dynamic-connect-from-example)
- [Actions (optional)](#actions-optional)
- [React hooks](#react-hooks)
- [Subscribes](#subscribes)
- [Dev-tools & history examples](#dev-tools-history-examples)




## Installation

```sh
npm install --save raxy
```

## API description

To create a new store call:
```typescript
new Raxy<IState>({initialState});
```
this returns two methods and proxied state

#### Methods

__connect the react component to the store:__
```typescript
connect<IComponentProps>(Component, mapper) : WrappedComponent;
```

__component__ - react component

__mapper__ - map store to component props (return Partial<IComponentProps>)
___

__connect listener to the store:__
```typescript
subscribe<T>(callback, mapper) : ISubscriber;
```
__callback__ - function with an argument containing the value returned by the _mapper_

__mapper__ - map store for _callback_ (return T)

retrun object with _off_ and _on_ methods;

#### Poxied state
```javascript
state
// you can chage this just chage object properties
```

---

## Simple usage

```javascript
import Raxy from 'raxy'; // with polyfill
import Raxy from 'raxy/next'; // without polyfill
```

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

#### Also you can subscribe or update item in arrays

```javascript
const ToDo = {
    list: [
        {title: 'item 1', finished: false},
        {title: 'item 2', finished: false},
        {title: 'item 3', finished: false},
    ]

export const {state, subscribe} = new Raxy({ToDo});

subscribe((s) => console.log(s), state => ({ list: state.list }));
subscribe((s) => console.log(s), state => ({ item: state.list[1] }));

state.list[1] = {title: 'item 1', finished: true};
state.list[1].finished = false
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

#### Dynamic connect (from example)

```javascript
// example/src/pageDynamic.tsx

import * as React from 'react';
import { connect } from '../store';
import ListDynamic from './listDynamic';

class PageDynamicComponent extends React.Component<any, any> {
    render() {
        return <div className={`page ${this.props.pathName.split('/')[1]}`}>
            <div>List B</div>
            <ListDynamic items={this.props.list} />
        </div>
    }
}

const PageDynamic = connect<any>(PageDynamicComponent, store => ({ list: store.listB, pathName: store.location.pathname }));
export default PageDynamic;
```

```javascript
// example/src/listDynamic.tsx
import * as React from 'react';
import { connect } from '../store';
import ListItem, { IListItemProps } from './listItem';

export default class ListDynamic extends React.Component<any, any> {

    click = (idx, item) => {
        // you can uodate props because it is Proxy or you can import 'state' from '../store';
        this.props.items[idx] = { label: item.label, finished: !item.finished };
    }

    defineListItem = idx => {
        // you can create connection dynamicly;
        return connect<IListItemProps>(ListItem, s => ({ item: s.listB[idx] }));
    }

    render() {
        return (
            <div className='list'>
                {this.props.items.map((item, idx) => {
                    const Item = this.defineListItem(idx);
                    return <Item key={idx} onClick={() => this.click(idx, item)} />;
                })}
            </div>
        )
    }
}
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

#### React hooks

You can work with hooks (from example)
```javascript
import { subscribe, state } from '../store';
import React, { useState, useEffect } from 'react';

// create custom hook
function useRaxy(mapper) {
    const [data, setState] = useState(mapper(state));

    useEffect(() => {
        let subscriber = subscribe(s => setState(s), mapper);
        return () => { // dont forget unsubscribe when dismount
            subscriber.off();
            subscriber = null;
        }
    });

    return data;
}

export function Hook() {
    const data = useRaxy(s => ({ val: 'nested is: ' + s.nested.itemOne }));

    return <div className='counter'>
        <div>{data.val} (Functional component with hook)</div>
    </div>
}
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