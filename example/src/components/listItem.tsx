
import * as React from 'react';

export interface IListItemProps {
    item: any;
    onClick(item);
}

export default class ListItem extends React.Component<IListItemProps, any> {
    render() {
        return (
            <div className='list-item' onClick={() => this.props.onClick(this.props.item)}>
                <div className="label">{this.props.item.label}</div>
                <div className={`check ${this.props.item.finished && 'finished' || ''}`}></div>
            </div>
        )
    }
}