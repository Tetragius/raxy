
import * as React from 'react';
import { state } from '../store';
import ListItem from './listItem';

export default class List extends React.Component<any, any> {

    click = item => {
        state.listA = state.listA.map(i => {
            if (item === i) {
                i.finished = !i.finished;
            }
            return i;
        })
    }
    render() {
        return (
            <div className='list'>
                {this.props.items.map((item, idx) => <ListItem key={idx} item={item} onClick={this.click} />)}
            </div>
        )
    }
}