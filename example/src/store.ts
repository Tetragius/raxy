import Raxy from 'raxy';
import { createHashHistory } from 'history';

export const history = createHashHistory({ basename: '/' });

const initialState = {
    listA: [
        { label: 'item 1', finished: false },
        { label: 'item 2', finished: true },
        { label: 'item 3', finished: false },
    ],
    listB: [
        { label: 'item 1', finished: false },
        { label: 'item 2', finished: true },
        { label: 'item 3', finished: false },
    ],
    nested: {
        itemOne: 1,
    },
    location: history.location,
}

const devTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__.connect();
const callback = store => devTools && devTools.send('change state', { value: { ...store } });

export const { state, connect, subscribe, componentDecorator } = new Raxy(initialState, callback);

devTools && devTools.init({ value: state });

history.listen(location => state.location = location);