import { connect } from './connect';
import { subscribe } from './subscribe';

const $parent = Symbol.for('parent');
const $updated = Symbol.for('updated');
const $name = Symbol.for('name');

export interface ISubscriber {
    off(): void;
    on(): void;
}

/**
 *
 *
 * @export
 * @class Raxy
 * @template S
 */
export default class Raxy<S> {
    public state: S = null;

    private proxyMap = new WeakMap();

    private subscribers = [];

    private callback = null;

    private hooks: ProxyHandler<any> = {
        set: (target, name, val, receiver) => {
            if (target[name] !== val) {

                if (name === $parent) {
                    target[name] = val;
                    return true;
                }

                if (typeof target[name] === 'object' || Array.isArray(target[name])) {
                    target[name] = this.proxier(val);
                }
                else {
                    target[name] = val;
                }

                this.subscribers.forEach(subscriber => {
                    const mapped = subscriber.mapper(this.store);
                    Object.assign(subscriber.state, mapped);
                    if (subscriber.needToUpdate) {
                        receiver[$updated] = true;
                        subscriber.updater(subscriber.state, () => (subscriber.needToUpdate = false));
                    }
                });

                if (receiver[$parent]) {
                    receiver[$parent][$updated] = true;
                }

                target[Symbol.for('updated')] = false;

                if (name !== $updated) {
                    this.callback && this.callback(this.store);
                }

            }
            return true;
        },
        deleteProperty: (target, name) => {

            const parent = target[name][$parent];

            if (Array.isArray(target) && target[name]) {
                target.splice(name as number, 1);
            } else {
                delete target[name];
            }

            parent[$updated] = true;


            return true;
        }
    }

    private store: S = null;

    /**
     * Creates an instance of Raxy.
     * @param {S} store
     * @param {(store: S) => void} callback Calls when state is updated
     * @memberof Raxy
     */
    constructor(store: S, callback: (store: S) => void) {
        this.store = { ...store };
        this.state = this.proxier(this.store);
        this.callback = callback;
    }

    /**
     * Connect react component to store, return wrapped component
     * @param {React.ComponentClass} component
     * @param {(state: S) => Partial<P>} mapper
     * @memberof Raxy
     */
    public connect = <P = any>(component: React.ComponentClass, mapper: (state: S) => Partial<P>): React.ComponentClass<Partial<P>> => {
        let subscriber;

        const init = (wrapper, listener) => {
            subscriber = subscribe(this.store, this.subscribers, listener, mapper);
            subscriber.wrapper = wrapper;
            return subscriber;
        }

        return connect<P>(component, init, wrapper => this.disposal(s => s.wrapper !== wrapper));
    }

    /**
     * ComponentClass decorator
     * @param {(state: S) => Partial<P>} mapper
     * @memberof Raxy
     */
    componentDecorator<P = any>(mapper) {
        const _connect = this.connect;
        return function classDecorator<T extends new(...args: any[]) => React.Component>(constructor: T) {
            return _connect<P>(constructor, mapper) as any;
        }
    }

    /**
     * Subscribe to store
     * @param {(P) => void} callback
     * @param {(state: S) => P} component
     * @memberof Raxy
     */
    public subscribe = <P>(callback, mapper: (state: S) => P): ISubscriber => {
        let subscriber;

        const listener = (state, cb) => { callback(state); cb(); }

        const init = () => subscriber = subscribe(this.store, this.subscribers, listener, mapper);
        init();

        const off = () => this.disposal(s => s !== subscriber);
        const on = () => init();

        return { off, on };
    }

    private disposal = exp => {
        this.subscribers = this.subscribers.filter(exp);
    }

    private proxier = (obj: any, name?: string, parent?: any): any => {

        if (this.proxyMap.has(obj)) {
            const oldProxy = this.proxyMap.get(obj);
            this.proxyMap.delete(obj);
            obj = oldProxy.obj;
            oldProxy.revoke();
        }

        const { proxy, revoke } = Proxy.revocable(obj, this.hooks);

        obj[$parent] = parent;
        obj[$name] = name;

        this.proxyMap.set(proxy, { revoke, obj, proxy });

        for (const key in obj) {
            if (obj[key] && typeof obj[key] === 'object' || Array.isArray(obj[key])) {
                obj[key] = this.proxier(obj[key], key, proxy);
            }
        }

        return proxy;
    }

}