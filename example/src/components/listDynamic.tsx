import * as React from 'react';
import { connect } from '../store';
import ListItem, { IListItemProps } from './listItem';

export default class ListDynamic extends React.Component<any, any> {

    click = (idx, item) => {
        this.props.items[idx] = { label: item.label, finished: !item.finished };
    }

    defineListItem = idx => {
        return connect<IListItemProps>(ListItem, s => ({ item: s.listB[idx] }));
    }

    render() {
        return (
            <div className='list'>
                {this.props.items.map((item, idx) => {
                    const Item = this.defineListItem(idx);
                    return <Item key={idx} onClick={() => this.click(idx, item)} />;
                })}
            </div>
        )
    }
}