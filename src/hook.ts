import {
    useCallback,
    useEffect,
    useState,
    createContext,
    useContext
} from "react";
import { IDetail, IRaxy, Transaction, raxy } from "./core";

import Symbols from './symbols';

const context = createContext(null);

type Filter<Store = typeof context, State = any> = (sotre: Store) => State;

export const Raxy = context.Provider;

export const useRaxy = <Store = any, State = any>(filter: Filter<Store, State>): { state: State, store: Store, transaction: Transaction<Store> } => {
    const instanse: IRaxy<Store> = useContext(context);

    if (!instanse) {
        return { state: null, store: null, transaction: null };
    }

    const saveNow = useCallback(
        (state) => {
            for (const key in state) {
                if (state[key] && state[key][Symbols.now]) {
                    state[key][Symbols.prevNow] = state[key][Symbols.now];
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

    return { state, store: instanse.store, transaction: instanse.transaction };
};

interface IRaxyWithHook<S> extends IRaxy<S> {
    useRaxy: <S, State = any>(filter: Filter<S, State>) => { state: State, store: S, transaction: Transaction<S> };
}

export const raxyReact = <Store = any>(initStore: Store): IRaxyWithHook<Store> => {
    const { subscribe, unsubscribe, store, transaction } = raxy(initStore);
    return { subscribe, unsubscribe, store, transaction, useRaxy }
}