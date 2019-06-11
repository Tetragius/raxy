import React from 'react';

export function connect(Component: React.ComponentClass, init, disposal): React.ComponentClass {

    return class extends React.Component {

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

        render() { return <Component  {...this.state} /> }

    }
}