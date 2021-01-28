import {
    useCallback,
    useEffect,
    useState,
    createContext,
    useContext,
    useMemo
} from "react";
import { IDetail, IRaxy, Transaction, raxy } from "./core";

import Symbols from './symbols';

const context = createContext(null);

type Filter<Store = typeof context, State = any> = (sotre: Store) => State;

type Options<State = any> = {
    [P in keyof State]?: { ignoreTimeStamp?: boolean }
}

export const Raxy = context.Provider;

export const useRaxy = <Store = any, State = any>(filter?: Filter<Store, State>, options?: Options<State>): { state: State, store: Store, transaction: Transaction<Store> } => {
    const instanse: IRaxy<Store> = useContext(context);

    if (!instanse) {
        return { state: null, store: null, transaction: null };
    }

    const nowMap = useMemo(() => new WeakMap(), []);

    const saveNow = useCallback(
        (state) => {
            if (state) {
                for (const key in state) {
                    if (state[key] && state[key][Symbols.now]) {
                        nowMap.set(state[key], state[key][Symbols.now]);
                    }
                }
            }
            return state;
        },
        []
    );

    const [state, setState] = useState(saveNow(filter?.(instanse.store)));

    const subscriber = useCallback(
        (e: CustomEvent<IDetail<Store>>) => {
            const newState = filter?.(e?.detail?.store) ?? null;
            console.log(1, options)
            if (newState) {
                for (const key in state) {
                    const option = options && options[key];
                    console.log(option)
                    if (
                        state[key] !== newState[key] ||
                        (!option?.ignoreTimeStamp && nowMap.has(state[key]) && nowMap.get(state[key]) !== newState[key][Symbols.now])
                    ) {
                        setState(saveNow(newState));
                        break;
                    }
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

type Hook<S> = <State = any>(filter?: Filter<S, State>, options?: Options<State>) => { state: State, store: S, transaction: Transaction<S> }

interface IRaxyWithHook<S> extends IRaxy<S> {
    useRaxy: Hook<S>;
}

export const raxyReact = <Store = any>(initStore: Store): IRaxyWithHook<Store> => {
    const { subscribe, unsubscribe, store, transaction } = raxy(initStore);
    return { subscribe, unsubscribe, store, transaction, useRaxy }
}