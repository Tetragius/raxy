
import * as React from 'react';
import PageDynamic from './pageDynamic';

export class PageFour extends React.Component<any, any> {
    render() {
        return <div className='lists'>
            <PageDynamic />
            <PageDynamic />
        </div>
    }
}