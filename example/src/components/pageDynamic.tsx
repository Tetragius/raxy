
import * as React from 'react';
import { componentDecorator } from '../store';
import ListDynamic from './listDynamic';

@componentDecorator(store => ({ list: store.listB, pathName: store.location.pathname, listCount: store.listB.length }))
export default class PageDynamic extends React.PureComponent<any, any> {
    render() {
        return <div className={`page ${this.props.pathName.split('/')[1]}`}>
            <div>List B</div>
            <ListDynamic items={this.props.list} l={this.props.listCount} />
        </div>
    }
}