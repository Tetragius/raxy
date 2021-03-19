import {
    useCallback,
    useEffect,
    useState,
    createContext,
    useContext,
    useMemo,
    RefObject,
    useRef
} from "react";
import { IDetail, IRaxy, IRaxyOptions, Transaction, raxy, Symbols } from "@tetragius/raxy";

const context = createContext(null);

export type Filter<Store = typeof context, State = any> = (sotre: Store) => State;

export type Options<State = any> = {
    [P in keyof State]?: { ignoreTimeStamp?: boolean };
}

export interface IOptions {
    elementRef?: RefObject<any>;
}

export const Raxy = context.Provider;

export const useRaxy = <Store = any, State = any>(filter?: Filter<Store, State>, options?: IOptions & Options<State>): { state: State, store: Store, transaction: Transaction<Store> } => {
    const instanse: IRaxy<Store> = useContext(context);

    if (!instanse) {
        return { state: null, store: null, transaction: null };
    }

    const nowMap = useMemo(() => new WeakMap(), []);

    const saveNow = useCallback(
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
        },
        []
    );

    const [state, setState] = useState(saveNow(filter?.(instanse.store)));

    const callbackRef = useRef(null);
    callbackRef.current = (e: CustomEvent<IDetail<Store>>) => {
        const newState = filter?.(e?.detail?.store) ?? null;
        if (newState) {
            for (const key in state) {
                const option = options && options[key];
                if (
                    state[key] !== newState[key] ||
                    (!option?.ignoreTimeStamp && nowMap.has(state[key]) && nowMap.get(state[key]) !== newState[key][Symbols.now])
                ) {
                    setState(saveNow(newState));
                    break;
                }
                if (!option?.ignoreTimeStamp && !nowMap.has(state[key])) {
                    setState(saveNow(newState));
                    break;
                }
                if (!nowMap.has(state[key])) {
                    saveNow(newState);
                }
            }
        }
    };

    const callback = useCallback((e) => callbackRef.current?.(e), [])

    const observerCallback = useCallback(
        (entry: IntersectionObserverEntry[]) => {
            if (!entry[0].isIntersecting) {
                instanse.unsubscribe("update", callback);
            }
            else {
                setState(saveNow(filter?.(instanse.store)));
                instanse.subscribe("update", callback);
            }
        },
        []
    );

    useEffect(() => {

        const element = options?.elementRef?.current;

        if (window.IntersectionObserver && element) {
            const observer = new IntersectionObserver(observerCallback, { threshold: 0 });
            observer.observe(element)

            return () => {
                observer.unobserve(element)
                instanse?.unsubscribe("update", callback);
            };
        }

        if (!options?.elementRef) {
            instanse?.subscribe("update", callback);

            return () => {
                instanse?.unsubscribe("update", callback);
            };
        }

        return null
    }, []);

    return { state, store: instanse.store, transaction: instanse.transaction };
};

export type Hook<S> = <State = any>(filter?: Filter<S, State>, options?: IOptions & Options<State>) => { state: State, store: S, transaction: Transaction<S> }

export interface IRaxyWithHook<S> extends IRaxy<S> {
    useRaxy: Hook<S>;
}

export const raxyReact = <Store = any>(initStore: Store, options?: IRaxyOptions): IRaxyWithHook<Store> => {
    const { subscribe, unsubscribe, store, transaction, transactions } = raxy(initStore, options);
    return { subscribe, unsubscribe, store, transaction, transactions, useRaxy }
}
export { connectDevTools, logger } from "@tetragius/raxy";