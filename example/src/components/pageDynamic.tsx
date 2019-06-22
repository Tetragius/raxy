
import * as React from 'react';
import { connect, state } from '../store';
import ListDynamic from './listDynamic';

class PageDynamicComponent extends React.PureComponent<any, any> {
    render() {
        return <div className={`page ${this.props.pathName.split('/')[1]}`}>
            <div>List B</div>
            <ListDynamic items={this.props.list} l={this.props.listCount} />
        </div>
    }
}

const PageDynamic = connect<any>(PageDynamicComponent, store => ({ list: store.listB, pathName: store.location.pathname, listCount: state.listB.length }));
export default PageDynamic;