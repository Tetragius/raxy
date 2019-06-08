export function subscribe<S, T>(store, subscribers, callback, mapper): void {
    
    const hooks = {
        set: (target, name, val) => {
            if (target[name] && target[name] !== val) { subscriber.needToUpdate = true; }
            target[name] = val;
            return true;
        }
    }

    const subscriber = {
        updater: (state, cb) => { callback(state); cb(); },
        state: new Proxy(mapper(store), hooks),
        mapper,
        needToUpdate: false
    }

    subscribers.push(subscriber);
}