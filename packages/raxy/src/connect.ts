import { IDetail, IRaxy, Transaction, raxy, IRaxyOptions } from "./core";

import Symbols from './symbols';

export type Filter<Store = any, State = any> = (sotre: Store) => State;

export type Options<State = any> = {
    [P in keyof State]?: { ignoreTimeStamp?: boolean };
}

export type RefObj<T = any> = { current: T } | (() => T)

export interface IConnectorOptions<T = any> {
    elementRef?: RefObj<T>;
}

export interface IConnector<Store, State> {
    state: State;
    store: Store;
    transaction: Transaction<Store>;
    mountCallback(): void;
    unmountCallback(): void;
}

const getRef = (ref: RefObj) => {
    if (typeof ref === 'function') {
        return ref();
    }

    return ref?.current;
}

export const connect = <Store = any, State = any>(instanse: IRaxy<Store>, updateCallback: (state: State) => void, filter?: Filter<Store, State>, options?: IConnectorOptions & Options<State>): IConnector<Store, State> => {

    if (!instanse) {
        return { state: null, store: null, transaction: null, mountCallback: null, unmountCallback: null };
    }

    const nowMap = new WeakMap<any>();
    let observer;
    let state = filter(instanse.store);

    const updateState = (newState) => {
        state = saveNow(newState);
        updateCallback(state);
    }

    const saveNow =
        (state) => {
            if (state) {
                for (const key in state) {
                    const value = state[key]
                    if (value && typeof value === 'object' && value[Symbols.now]) {
                        nowMap.set(value, value[Symbols.now]);
                    }
                }
            }
            return state;
        };


    const callbackRef = (e: CustomEvent<IDetail<Store>>) => {
        const newState = filter?.(e?.detail?.store) ?? null;
        if (newState) {
            for (const key in state) {
                const option = options && options[key];
                const value = state[key];
                const newValue = newState[key];
                if (value !== newValue) {
                    updateState(newState);
                    break;
                }
                if (value && typeof value === 'object') {
                    if ((!option?.ignoreTimeStamp && nowMap.has(value)) && nowMap.get(value) !== newValue[Symbols.now]) {
                        updateState(newState);
                        break;
                    }
                    if (!option?.ignoreTimeStamp && !nowMap.has(value)) {
                        updateState(newState);
                        break;
                    }
                    if (!nowMap.has(value)) {
                        saveNow(newState);
                    }
                }
            }
        }
    };

    const observerCallback =
        (entry: IntersectionObserverEntry[]) => {
            if (!entry[0].isIntersecting) {
                instanse.unsubscribe("update", callbackRef);
            }
            else {
                updateState(filter?.(instanse.store));
                instanse.subscribe("update", callbackRef);
            }
        };

    const mountCallback = () => {
        const element = getRef(options?.elementRef);

        if (window.IntersectionObserver && element) {
            observer = new IntersectionObserver(observerCallback, { threshold: 0 });
            observer.observe(element)
        }

        if (!options?.elementRef) {
            instanse?.subscribe("update", callbackRef);
        }
    }

    const unmountCallback = () => {
        const element = getRef(options?.elementRef);

        if (window.IntersectionObserver && element) {
            observer.unobserve(element)
            instanse?.unsubscribe("update", callbackRef);
        }

        if (!options?.elementRef) {
            instanse?.unsubscribe("update", callbackRef);
        }
    }

    return { state, store: instanse.store, transaction: instanse.transaction, mountCallback, unmountCallback };
};

export type Connector<S> = <State = any>(updateCallback: (state: State) => void, filter?: Filter<S, State>, options?: IConnectorOptions & Options<State>) => IConnector<S, State>

export interface IRaxyWithConnector<S> extends IRaxy<S> {
    connect: Connector<S>;
}

const carryInstanse = <S>(instanse: IRaxy<S>): Connector<S> => {
    return (callback, filter, options) => connect(instanse, callback, filter, options);
}

export const createConnector = <Store = any>(initStore: Store, options?: IRaxyOptions): IRaxyWithConnector<Store> => {
    const instanse = raxy(initStore, options);
    return { ...instanse, connect: carryInstanse(instanse) }
}