import { subscribe, state } from '../store';
import React, { useState, useEffect } from 'react';

function useRaxy(mapper) {
    const [data, setState] = useState(mapper(state));

    useEffect(() => {
        subscribe(s => setState(s), mapper);
    });

    return data;
}

export function Hook() {
    const data = useRaxy(s => ({ val: 'nested is: ' + s.nested.itemOne }));

    return <div className='counter'>
        <div>{data.val} (Functional component with hook)</div>
    </div>
}