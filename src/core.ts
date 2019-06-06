import { connect } from './connect';

export default class Raxy<S> {
    public state: S = null;

    private subscribers = [];

    private hooks = {
        set: (target, name, val, receiver) => {
            if (target[name] !== val) {
                target[name] = val;
                this.subscribers.forEach(subscriber => {
                    Object.assign(subscriber.state, subscriber.mapper(this.store));
                    if (subscriber.needToUpdate) {
                        subscriber.updater(prevData => {
                            return subscriber.state;
                        }, () => (subscriber.needToUpdate = false));
                    }
                });
            }
            return true;
        },
        get: (target, name, receiver) => {
            return target[name];
        }

    }
    private store: S = null;

    constructor(store: S) {
        this.store = { ...store };
        this.state = new Proxy(this.store, this.hooks);
    }

    public connect = <P>(component: React.ComponentClass, mapper: (s: S) => P): React.ComponentClass => {
        return connect(component, mapper, this.store, this.subscribers)
    }

}