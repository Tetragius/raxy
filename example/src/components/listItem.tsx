
import * as React from 'react';

export interface IListItemProps {
    item: any;
    onClick(item);
    onDelete?(item);
}

export default class ListItem extends React.Component<IListItemProps, any> {
    render() {
        return (
            <div className='list-item'>
                <div className='label'>{this.props.item.label}</div>
                <div className={`check ${this.props.item.finished && 'finished' || ''}`} onClick={() => this.props.onClick(this.props.item)} />
                {this.props.onDelete && <div className={`delete`} onClick={() => this.props.onDelete(this.props.item)}>X</div>}
            </div>
        )
    }
}