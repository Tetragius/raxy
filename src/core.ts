import { connect } from './connect';
import { subscribe } from './subscribe';
import Symbols from './symbols';

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

                if (typeof target[name] === 'object' || Array.isArray(target[name])) {
                    target[name] = this.proxier(val, name as string, receiver);
                }
                else if (typeof val === 'object' || Array.isArray(val)) {
                    target[name] = this.proxier(val, name as string, receiver);
                }
                else {
                    target[name] = val;
                }

                this.remark(target, true);
                this.send();
                this.remark(target, false);

                this.callback && this.callback(this.store);

            }
            return true;
        },
        get: (target, name) => {
            if (name === Symbols.source) {
                return target;
            }
            return target[name];
        },
        deleteProperty: (target, name) => {

            this.clearProxy(target[name][Symbols.source]);

            this.remark(target, true);

            if (Array.isArray(target) && target[name]) {
                target.splice(name as number, 1);
            } else {
                delete target[name];
            }

            this.send();

            this.callback && this.callback(this.store);

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
    constructor(store: S, callback?: (store: S) => void) {
        this.apply(store);
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
    public componentDecorator = <P = any>(mapper) => {
        const _connect = this.connect;
        return <T extends new (...args: any[]) => React.Component>(constructor: T) =>
            _connect<P>(constructor, mapper) as any;
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

    private clone = (obj: any): any => {
        if (typeof obj !== 'object' && !Array.isArray(obj)) {
            return obj;
        }
        const target: S = {} as S;
        for (const prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                const _obj = obj[prop];
                if (typeof _obj !== 'symbol') {
                    if (Array.isArray(_obj)) {
                        target[prop] = [..._obj.map(this.clone)];
                    } else if (typeof _obj === 'object') {
                        target[prop] = this.clone(_obj);
                    } else {
                        target[prop] = _obj;
                    }
                }
            }
        }
        return target;
    }

    private apply = newState => {
        this.store = this.clone(newState);
        this.state = this.proxier(this.store);
    }

    private clearProxy = source => {
        let obj = null;
        if (this.proxyMap.has(source)) {
            const oldProxy = this.proxyMap.get(source);
            this.proxyMap.delete(source);
            obj = oldProxy.obj;
            oldProxy.revoke();
        }
        return obj;
    }

    private disposal = exp => {
        this.subscribers = this.subscribers.filter(exp);
    }

    private remark = (target, flag) => {
        const { source, parent, updated } = Symbols;
        const src = target[source];
        if (src) {
            src[updated] = flag;
            let _target = target[parent];
            while (_target) {
                _target[source][updated] = flag;
                _target = _target[parent]
            }
        }
    }

    private send = () => {
        this.subscribers.forEach(subscriber => {
            const mapped = subscriber.mapper(this.store);
            Object.assign(subscriber.state, mapped);
            if (subscriber.needToUpdate) {
                subscriber.updater(subscriber.state, () => (subscriber.needToUpdate = false));
            }
        });
    }

    private proxier = (obj: any, name?: string, prnt?: any): any => {

        const { source, parent, id } = Symbols;

        if (!obj[id]) {
            obj[id] = Math.random().toString(36).substr(2, 9);
        }

        const src = obj[source] || obj;

        obj = this.clearProxy(src) || obj;

        const { proxy, revoke } = Proxy.revocable(obj, this.hooks);

        obj[parent] = prnt;
        obj[name] = name;
        obj[source] = obj;

        this.proxyMap.set(obj, { revoke, obj, proxy });

        // tslint:disable-next-line: forin
        for (const key in obj) {
            const _obj = obj[key];
            if (_obj && typeof _obj === 'object' || Array.isArray(_obj)) {
                obj[key] = this.proxier(_obj, key, proxy);
            }
        }

        return proxy;
    }

}