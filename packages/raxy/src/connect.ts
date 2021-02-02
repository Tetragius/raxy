import { IDetail, IRaxy, Transaction, raxy } from "./core";

import Symbols from './symbols';

type Filter<Store = any, State = any> = (sotre: Store) => State;

type Options<State = any> = {
    [P in keyof State]?: { ignoreTimeStamp?: boolean };
}

type RefObj<T = any> = { current: T } | (() => T)

interface IConnectorOptions<T = any> {
    elementRef?: RefObj<T>;
}

interface IConnector<Store, State> {
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

                const descriptors = Object.getOwnPropertyDescriptors(state);
                Object.keys(descriptors)
                    .filter(key => descriptors[key].get)
                    .forEach(key => Object.defineProperty(state, key, { value: state[key] }));

                for (const key in state) {
                    if (state[key] && state[key][Symbols.now]) {
                        nowMap.set(state[key], state[key][Symbols.now]);
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
                if (
                    state[key] !== newState[key] ||
                    (!option?.ignoreTimeStamp && nowMap.has(state[key]) && nowMap.get(state[key]) !== newState[key][Symbols.now])
                ) {
                    updateState(newState);
                    break;
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

type Connector<S> = <State = any>(updateCallback: (state: State) => void, filter?: Filter<S, State>, options?: IConnectorOptions & Options<State>) => IConnector<S, State>

interface IRaxyWithConnector<S> extends IRaxy<S> {
    connect: Connector<S>;
}


const carryInstanse = <S>(instanse: IRaxy<S>): Connector<S> => {
    return (...args) => connect(instanse, ...args);
}

export const createConnector = <Store = any>(initStore: Store): IRaxyWithConnector<Store> => {
    const instanse = raxy(initStore);
    return { ...instanse, connect: carryInstanse(instanse) }
}