import React from 'react';

export function connect<P>(Component: React.ComponentClass, init, disposal): React.ComponentClass<P> {

    return class extends React.Component<P> {

        constructor(props) {
            super(props);
        }

        componentWillMount() {
            const subscriber = init(this, this.setState.bind(this));
            this.setState(subscriber.state);
        }

        componentWillUnmount() {
            disposal(this);
        }

        render() { return <Component  {...this.state} {...this.props} /> }

    }
}