import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { Router, Route } from 'react-router';
import Page from './components/page';
import { connect, state, history } from './store';
import CounterComponent from './components/counter';
import { hot } from 'react-hot-loader';
import PageDynamic from './components/pageDynamic';
import { Hook } from './components/hook';

const ConterFinishedA = connect(CounterComponent, store => ({ value: 'finised tasks of list A: ' + store.listA.filter(i => i.finished).length }));
const ConterFinishedB = connect(CounterComponent, store => ({ value: 'finised tasks of list B: ' + store.listB.filter(i => i.finished).length }));
const CurrentLocation = connect(CounterComponent, store => ({ value: 'current location is: ' + store.location.pathname }));
const CountNested = connect(CounterComponent, store => ({ value: 'nested is: ' + store.nested.itemOne }));

class App extends React.Component {

    appendA = () => {
        state.listA = [...state.listA, { label: 'item ' + (state.listA.length + 1), finished: false }];
    }

    appendB = () => {
        state.listB = [...state.listB, { label: 'item ' + (state.listB.length + 1), finished: false }];
    }

    increment = () => state.nested.itemOne += 1;

    render() {
        return <Router history={history}>
            <div>
                <div className='link' onClick={() => history.push('/')}>home</div>
                <div className='link' onClick={() => history.push('/route-one')}>page one</div>
                <div className='link' onClick={() => history.push('/route-two')}>page two</div>
                <Route exact={true} path='/' component={CountNested} />
                <Route exact={true} path='/route-one' component={Page} />
                <Route exact={true} path='/route-two' component={PageDynamic} />
                <div className='append' onClick={this.appendA}>Add item to list A</div>
                <div className='append' onClick={this.appendB}>Add item to list B</div>
                <div className='append' onClick={this.increment}>Increment nested</div>
                <ConterFinishedA />
                <ConterFinishedB />
                <CurrentLocation />
                <Hook />
            </div>
        </Router>
    }
}

const HotApplication = hot(module)(App);
ReactDOM.render(<HotApplication />, document.getElementById('app'));