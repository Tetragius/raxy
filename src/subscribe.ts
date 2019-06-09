export function subscribe<S, T>(store, subscribers, callback, mapper): void {

    const hooks = {
        set: (target, name, val) => {
            if (target[name] && target[name] !== val) { subscriber.needToUpdate = true; }
            target[name] = val;
            return true;
        }
    }

    const proxyer = data => {
        if (typeof data === 'object') {
            return new Proxy(data, hooks);
        }
        return data;
    }

    const subscriber = {
        updater: (state, cb) => { callback(state); cb(); },
        state: proxyer(mapper(store)),
        mapper,
        needToUpdate: false
    }

    subscribers.push(subscriber);
}