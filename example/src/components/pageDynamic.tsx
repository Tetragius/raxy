
import * as React from 'react';
import { connect } from '../store';
import ListDynamic from './listDynamic';

class PageDynamicComponent extends React.Component<any, any> {
    render() {
        return <div className={`page ${this.props.pathName.split('/')[1]}`}>
            <div>List B</div>
            <ListDynamic items={this.props.list} />
        </div>
    }
}

const PageDynamic = connect<any>(PageDynamicComponent, store => ({ list: store.listB, pathName: store.location.pathname }));
export default PageDynamic;