import Symbols from './symbols';

interface ITransact<S> { name: string, complete: boolean, store: S }
type Rollback = () => void;
type Updater<S> = (store: S) => Promise<boolean>;
type Resolver<S> = (data: ITransact<S>) => void;
export type Transaction<S> = (name: string, updater: Updater<S>) => Promise<ITransact<S>>
export type EventHandler<S> = (event: CustomEvent<IDetail<S>>) => void;

type EventTypes = 'update' | 'transactionstart' | 'transactionend';

export interface IDetail<S> {
    name?: string;
    complete?: string;
    store: S;
}

export interface ITransaction<S> {
    pending: boolean;
    rollback: Rollback[];
    name: string;
    updater: Updater<S>;
    resolve: Resolver<S>
}

export interface IRaxy<S> {
    subscribe(on: EventTypes, subscriber: EventHandler<S>): void;
    unsubscribe(on: EventTypes, subscriber: EventHandler<S>): void;
    store: S;
    transaction: Transaction<S>;
}

export const raxy = <Store = any>(initStore: Store): IRaxy<Store> => {
    const eventTarget = new EventTarget();
    const transactions: ITransaction<Store>[] = [];
    let timer: number = 0;
    let now = Date.now();

    const updateParents = (obj: any) => {
        const parent = obj[Symbols.parent];
        if (parent) {
            parent[Symbols.now] = now;
            updateParents(parent);
        }
    }

    const hooks = {
        set: (target: any, prop: string | symbol, value: any, rec: any) => {
            const oldValue = target[prop];

            if (typeof value === "object" && !value[Symbols.now]) {
                value[Symbols.now] = now;
                value[Symbols.prevNow] = now;
                value[Symbols.parent] = target;
                updateParents(value);
                target[prop] = new Proxy(value, hooks);
                proxier(value);
            } else if (
                typeof value !== "object" &&
                value !== target[prop] &&
                typeof prop !== "symbol"
            ) {
                target[Symbols.now] = now;
                target[prop] = value;
                updateParents(target);
            } else if (
                prop === Symbols.prevNow
            ) {
                target[prop] = value;
            } else {
                return true;
            }

            if (transactions[0]?.pending) {
                transactions[0].rollback.push(() => {
                    if (oldValue) {
                        rec[prop] = oldValue;
                        rec[Symbols.now] = now;
                    } else if (Array.isArray(rec)) {
                        target.splice(prop, 1);
                        rec[Symbols.now] = now;
                    } else {
                        delete target[prop];
                        rec[Symbols.now] = now;
                    }
                    updateParents(rec);
                });
            }

            if (timer) {
                clearTimeout(timer);
            }

            timer = setTimeout(() => {
                now = Date.now();
                eventTarget.dispatchEvent(
                    new CustomEvent("update", { detail: { store: initStore } })
                );
            });

            return true;
        }
    };

    const proxier = (obj: Object) => {
        for (const key in obj) {
            let sub = obj[key];
            if (typeof sub === "object" && typeof key !== "symbol") {
                sub[Symbols.now] = now;
                sub[Symbols.prevNow] = now;
                sub[Symbols.parent] = obj;
                if (sub[Symbols.parent]) {
                    sub[Symbols.parent] = obj;
                }
                else {
                    const proxy = new Proxy(sub, hooks);
                    obj[key] = proxy;
                }
                proxier(sub);
            }
        }
    };

    const store: Store = new Proxy(initStore, hooks);
    proxier(initStore);

    const transaction = async (name: string, updater: Updater<Store>): Promise<ITransact<Store>> => {
        const doTransaction = async () => {
            if (transactions[0]?.pending || !transactions.length) {
                return;
            }

            const transaction = transactions[0];

            eventTarget.dispatchEvent(
                new CustomEvent("transactionstart", {
                    detail: { name: transaction.name, store }
                })
            );

            transaction.pending = true;
            const complete = await transaction.updater(store);
            transaction.pending = false;

            if (!complete) {
                transaction.rollback.forEach((rb: Rollback) => rb());
            }

            transaction.resolve({ name: transaction.name, complete, store });

            eventTarget.dispatchEvent(
                new CustomEvent("transactionend", {
                    detail: { name: transaction.name, complete, store }
                })
            );

            transactions.shift();
            doTransaction();
        };

        return new Promise((resolve) => {
            transactions.push({ name, updater, resolve, rollback: [], pending: false });
            doTransaction();
        });
    };

    const subscribe = (on: EventTypes, subscriber: EventHandler<Store>) =>
        eventTarget.addEventListener(on, subscriber);

    const unsubscribe = (on: string, subscriber: EventHandler<Store>) =>
        eventTarget.removeEventListener(on, subscriber);

    return { subscribe, unsubscribe, store, transaction };
};

export default raxy;