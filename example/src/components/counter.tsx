
import * as React from 'react';

export default class CounterComponent extends React.Component<any, any> {
    render() {
        return (
            <div className='counter'>
                <div>{this.props.value}</div>
            </div>
        )
    }
}