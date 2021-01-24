import {
    useCallback,
    useEffect,
    useState,
    createContext,
    useContext
} from "react";
import { IDetail, IRaxy } from "./core";

import Symbols from './symbols';

const context = createContext(null);

type Filter<Store = typeof context, State = any> = (sotre: Store) => State;

export const Manager = context.Provider;

export const useRaxy = <Store = typeof instanse, State = any>(filter: Filter<Store, State>) => {
    const instanse: IRaxy<Store> = useContext(context);

    if (!instanse) {
        return;
    }

    const saveNow = useCallback(
        (state) => {
            for (const key in state) {
                if (state[key][Symbols.now]) {
                    state[key][Symbols.prevNow] = state[key][Symbols.now];
                    console.log(state[key][Symbols.now], state[key][Symbols.prevNow]);
                }
            }
            return state;
        },
        []
    );

    const [state, setState] = useState(saveNow(filter(instanse.store)));

    const subscriber = useCallback(
        (e: CustomEvent<IDetail<Store>>) => {
            const newState = filter(e.detail.store);
            for (const key in state) {
                console.log(
                    state[key],
                    newState[key],
                    state[key] !== newState[key],
                    state[key][Symbols.prevNow],
                    newState[key][Symbols.now],
                    state[key][Symbols.prevNow] !== newState[key][Symbols.now]
                );
                if (
                    state[key] !== newState[key] ||
                    state[key][Symbols.prevNow] !== newState[key][Symbols.now]
                ) {
                    setState(saveNow(newState));
                    break;
                }
            }
        },
        [filter, state, saveNow]
    );

    useEffect(() => {
        instanse.subscribe("update", subscriber);
        return () => {
            instanse.unsubscribe("update", subscriber);
        };
    }, [instanse, subscriber]);

    return state;
};
