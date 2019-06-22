import * as React from 'react';
import { connect, state } from '../store';
import ListItem, { IListItemProps } from './listItem';

export default class ListDynamic extends React.PureComponent<any, any> {

    click = (idx, item) => {
        state.listB[idx].finished = !item.finished;
    }

    delete = (idx, item) => {
        delete state.listB[idx];
    }

    defineListItem = idx => {
        return connect<IListItemProps>(ListItem, s => ({ item: s.listB[idx] }));
    }

    render() {
        return (
            <div className='list'>
                {this.props.items.map((item, idx) => {
                    const Item = this.defineListItem(idx);
                    return <Item key={idx} onClick={i => this.click(idx, i)} onDelete={i => this.delete(idx, i)} />;
                })}
            </div>
        )
    }
}