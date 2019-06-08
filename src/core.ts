import { connect } from './connect';
import { subscribe } from './subscribe';

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

    private hooks = {
        set: (target, name, val, proxed) => {
            if (target[name] !== val) {
                if (typeof target[name] === 'object') {
                    target[name] = this.proxyer(val);
                }
                else {
                    target[name] = val;
                }
                this.subscribers.some(subscriber => {
                    const subscriberState = subscriber.state;
                    for (const key in subscriberState) {
                        if (subscriberState[key] && subscriberState[key] === proxed) {
                            for (const obj in this.state) {
                                if (this.state[obj] && this.state[obj] === proxed) {
                                    this.state[obj] = this.proxyer(proxed);
                                }
                            }
                            return true;
                        }
                    }
                    const mapped = subscriber.mapper(this.store);
                    Object.assign(subscriberState, mapped);
                    if (subscriber.needToUpdate) {
                        subscriber.updater(subscriberState, () => (subscriber.needToUpdate = false));
                    }
                    return false;
                });
            }
            return true;
        }
    }

    private store: S = null;

    constructor(store: S) {
        this.store = { ...store };
        this.state = this.proxyer(this.store);
    }

    /**
     *
     *
     * @memberof Raxy
     */
    public connect = <P>(component: React.ComponentClass, mapper: (state: S) => P): React.ComponentClass => {
        return connect(component, mapper, this.store, this.subscribers);
    }

    /**
     *
     *
     * @memberof Raxy
     */
    public subscribe = <P>(callback, mapper: (state: S) => P): void => {
        subscribe(this.store, this.subscribers, callback, mapper);
    }

    private proxyer = (obj: any): any => {

        if (this.proxyMap.has(obj)) {
            const oldProxy = this.proxyMap.get(obj);
            this.proxyMap.delete(obj);
            obj = oldProxy.obj;
            oldProxy.revoke();
        }

        for (const key in obj) {
            if (obj[key] && typeof obj[key] === 'object') {
                obj[key] = this.proxyer(obj[key]);
            }
        }

        const { proxy, revoke } = Proxy.revocable(obj, this.hooks);

        this.proxyMap.set(proxy, { revoke, obj });

        return proxy;
    }

}