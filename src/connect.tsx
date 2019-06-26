import React from 'react';

export function connect<P>(Component: React.ComponentClass, init, disposal): React.ComponentClass<P> {

    return class extends React.Component<P> {

        constructor(props) {
            super(props);
        }

        componentWillMount() {
            const subscriber = init(this, (state, cb) => {
                this.setState({ ...state }, cb);
                // this.forceUpdate();
            });
            this.setState(subscriber.state);
        }

        componentWillUnmount() {
            disposal(this);
        }

        render() { return <Component  {...this.state} {...this.props} /> }

    }
}