
import * as React from 'react';
import { connect, history } from '../store';


class NavComponent extends React.Component<any, any> {
    render() {
        return <div className='nav'>
            <div className={`link${this.props.pathname === '/' && ' active' || ''}`} onClick={() => history.replace('/')}>home</div>
            <div className={`link${this.props.pathname === '/route-one' && ' active' || ''}`} onClick={() => history.replace('/route-one')}>page one</div>
            <div className={`link${this.props.pathname === '/route-two' && ' active' || ''}`} onClick={() => history.replace('/route-two')}>page two</div>
            <div className={`link${this.props.pathname === '/route-three' && ' active' || ''}`} onClick={() => history.replace('/route-three')}>page three</div>
        </div>
    }
}

const Nav = connect<any>(NavComponent, store => ({ pathname: store.location.pathname }));
export default Nav;