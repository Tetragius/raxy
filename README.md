![logo](logo.png?raw=true "logo")

[![Build Status](https://travis-ci.org/Tetragius/raxy.svg?branch=master)](https://travis-ci.org/Tetragius/raxy) [![npm version](https://badge.fury.io/js/raxy.svg)](https://badge.fury.io/js/raxy) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Raxy (ReAct + ProXY)

Simple react state manager. You can work with state as with a regular object.
Can be used with redux-devtools-extension and history.

```typescript
const initalState = {any: 1};
const {state, connect, subscribe} = Raxy<IState>(initalState); 

/* IState */ state.any = 5; // update state;

connect<IComponentProps>(Component: ComponentClass, mapper(state: IState):IComponentProps)

subscribe<IProps>(callback(props: IProps), mapper(state: IState):IProps)

```

Based on JS Proxy API and works with all browsers that support it. 


## Installation

```sh
npm install --save raxy
```

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

##Subscribes

```javascript
const {state, connect, /*!!*/ subscribe /*!!*/} = new Raxy({ToDo, AnotherToDo, Another});

subscribe((state) => console.log(state), s => ({...s})); // example
```

##Dev-tools & history examples

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

testStore.subscribe(location => console.log(location), state => ({ location: state.location }));

history.listen(location => state.location = location);
```

```javascript
const {state, subscribe} = new Raxy({});

const devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect();

devTools.init({ value: state });

subscribe(state => devTools.send('change state', { value: state }), state => ({ ...state }));
```