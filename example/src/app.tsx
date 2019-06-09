import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { Router, Route } from 'react-router';
import Page from './components/page';
import { connect, state, history } from './store';
import CounterComponent from './components/counter';
import { hot } from 'react-hot-loader';

const ConterFinished = connect(CounterComponent, store => ({ value: 'finised tasks: ' + store.list.filter(i => i.finished).length }));
const CurrentLocation = connect(CounterComponent, store => ({ value: 'current location: ' + store.location.pathname }));

class App extends React.Component {

    append = () => {
        state.list = [...state.list, { label: 'item ' + (state.list.length + 1), finished: false }];
    }
    render() {
        return <Router history={history}>
            <div>
                <div className="link" onClick={() => history.push('/')}>home</div>
                <div className="link" onClick={() => history.push('/route-one')}>page one</div>
                <div className="link" onClick={() => history.push('/route-two')}>page two</div>
                <Route exact={true} path='/route-one' component={Page} />
                <Route exact={true} path='/route-two' component={Page} />
                <div className='append' onClick={this.append}>Add item</div>
                <ConterFinished />
                <CurrentLocation />
            </div>
        </Router>
    }
}

const HotApplication = hot(module)(App);
ReactDOM.render(<HotApplication />, document.getElementById('app'));