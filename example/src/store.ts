import Raxy from 'raxy';
import { createHashHistory } from 'history';

export const history = createHashHistory({ basename: '/' });

const initialState = {
    list: [
        { label: 'item 1', finished: false },
        { label: 'item 2', finished: true },
        { label: 'item 3', finished: false },
    ],
    nested: {
        itemOne: 1,
    },
    location: history.location,
}

export const { state, connect, subscribe } = new Raxy(initialState);

history.listen(location => state.location = location);

const devTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__.connect();
devTools.init({ value: state });
subscribe(s => devTools.send('change state', { value: s }), s => ({ ...s }));