
import * as React from 'react';
import Page from './page';
import PageDynamic from './pageDynamic';

export class PageThree extends React.Component<any, any> {
    render() {
        return <div className='lists'>
            <Page />
            <PageDynamic />
        </div>
    }
}