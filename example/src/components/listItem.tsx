
import * as React from 'react';

export interface IListItemProps {
    item: any;
    onClick(item);
}

export default class ListItem extends React.Component<IListItemProps, any> {
    render() {

    console.log(this.props.item);
        return (
            <div className='list-item' onClick={() => this.props.item.finished = false }>
                <div className="label">{this.props.item.label}</div>
                <div className={`check ${this.props.item.finished && 'finished' || ''}`}></div>
            </div>
        )
    }
}