import React from 'react';

export function connect(Component: React.ComponentClass, mapper, store, subscribers): React.ComponentClass {
    return class extends React.Component {

        subscriber = null;

        hooks = {
            set: (target, name, val) => {
                if (target[name] && target[name] !== val) { this.subscriber.needToUpdate = true; }
                target[name] = val;
                return true;
            },
            get: (target, name) => target[name]
        }

        constructor(props) {
            super(props);
            this.subscriber = {
                updater: this.setState.bind(this),
                state: new Proxy(mapper(store), this.hooks),
                mapper,
                needToUpdate: false
            }
            subscribers.push(this.subscriber);
        }

        componentWillMount() { this.setState(this.subscriber.state); }

        render() { return <Component  {...this.state} /> }
    }
}