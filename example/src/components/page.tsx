
import * as React from 'react';
import { connect } from '../store';
import List from './list';

class PageComponent extends React.Component<any, any> {
    render() {
        return <div className={`page ${this.props.pathName.split('/')[1]}`}>
            <div>List A</div>
            <List items={this.props.list} />
        </div>
    }
}

const Page = connect<any>(PageComponent, store => ({ list: store.listA, pathName: store.location.pathname, length: store.listA.length }));
export default Page;