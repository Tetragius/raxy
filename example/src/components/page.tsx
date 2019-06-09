
import * as React from 'react';
import { connect } from '../store';
import List from './list';

class PageComponent extends React.Component<any, any> {
    render() {
        return <div className={`page ${this.props.pathName.split('/')[1]}`}>
            <List items={this.props.list} />
        </div>
    }
}

const Page = connect<any>(PageComponent, store => ({ list: store.list, pathName: store.location.pathname }));
export default Page;