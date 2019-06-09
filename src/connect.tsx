import React from 'react';

export function connect(Component: React.ComponentClass, mapper, store, subscribers): React.ComponentClass {
    return class extends React.Component {

        subscriber = null;

        hooks = {
            set: (target, name, val) => {
                if (target[name] && target[name] !== val) { this.subscriber.needToUpdate = true; }
                target[name] = val;
                return true;
            }
        }

        constructor(props) {
            super(props);
            this.subscriber = {
                updater: this.setState.bind(this),
                state: this.proxyer(mapper(store)),
                mapper,
                needToUpdate: false
            }
            subscribers.push(this.subscriber);
        }

        componentWillMount() { this.setState(this.subscriber.state); }

        render() { return <Component  {...this.state} /> }

        private proxyer = data => {
            if (typeof data === 'object') {
                return new Proxy(data, this.hooks);
            }
            return data;
        }
    }
}