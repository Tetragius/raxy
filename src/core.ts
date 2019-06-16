import { connect } from './connect';
import { subscribe } from './subscribe';

interface ISubscriber {
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

    private proxyMap = new Map();

    private subscribers = [];

    private callback = null;

    private hooks = {
        set: (target, name, val) => {
            if (target[name] !== val) {

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
                        subscriber.updater(subscriber.state, () => (subscriber.needToUpdate = false));
                    }
                });

                this.callback && this.callback(this.store);

            }
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

    private proxier = (obj: any): any => {

        if (this.proxyMap.has(obj)) {
            const oldProxy = this.proxyMap.get(obj);
            this.proxyMap.delete(obj);
            obj = oldProxy.obj;
            oldProxy.revoke();
        }

        for (const key in obj) {
            if (obj[key] && typeof obj[key] === 'object' || Array.isArray(obj[key])) {
                obj[key] = this.proxier(obj[key]);
            }
        }

        const { proxy, revoke } = Proxy.revocable(obj, this.hooks);

        this.proxyMap.set(proxy, { revoke, obj });

        return proxy;
    }

}