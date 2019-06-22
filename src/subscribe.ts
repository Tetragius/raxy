const $updated = Symbol.for('updated');

export function subscribe<S>(store, subscribers, listener, mapper): any {

    const hooks: ProxyHandler<any> = {
        set: (target, name, val) => {

            if (target[name] !== val || (val && val[$updated])) {
                subscriber.needToUpdate = true; 
            }

            target[name] = val;
            
            return true;
        },
        get: (target, name) => {
            const current = mapper(store);
            return current[name];
        }
    }

    const proxier = data => {
        if (typeof data === 'object') {
            return new Proxy(data, hooks);
        }
        return data;
    }

    const subscriber = {
        updater: listener,
        state: proxier(mapper(store)),
        mapper,
        needToUpdate: false,
        wrapper: null
    }

    subscribers.push(subscriber);

    return subscriber;
}