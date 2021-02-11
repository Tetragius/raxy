import Symbols from './symbols';

export interface ITransact<S> { name: string, complete: boolean, store: S, aborted?: { status: any } }
export type Abort = (status: any) => void;
export type Progress = (n: number) => void;
export type Rollback = () => void;
export type Updater<S> = (store: S, progress: Progress) => Promise<boolean>;
export type Resolver<S> = (data: ITransact<S>) => void;
export type Transaction<S> = (name: string, updater: Updater<S>) => Promise<ITransact<S>>
export type EventHandler<S> = (event: CustomEvent<IDetail<S>>) => void;

export type EventTypes = 'update' | 'transactionstart' | 'transactionend' | 'addtransaction' | 'transactionaborted' | 'transactionprogress' | 'connected';

export interface IDetail<S> {
    name?: string;
    complete?: boolean;
    store: S;
    transactions?: ITransaction<S>[];
    progress?: number;
    value?: any;
}

export interface IRaxyOptions {
    disableTimer?: boolean;
}

export interface ITransaction<S> {
    pending: boolean;
    rollback: Rollback[];
    name: string;
    updater: Updater<S>;
    resolve: Resolver<S>
    progress: number;
    abort: Abort;
}

export interface IRaxy<S> {
    subscribe(on: EventTypes, subscriber: EventHandler<S>): void;
    unsubscribe(on: EventTypes, subscriber: EventHandler<S>): void;
    store: S;
    transaction: Transaction<S>;
    transactions: ITransaction<S>[]
}

export const raxy = <Store = any>(initStore: Store, options?: IRaxyOptions): IRaxy<Store> => {
    const eventTarget = new EventTarget();
    const transactions: ITransaction<Store>[] = [];
    let timer: number = 0;
    let now = Date.now();

    const updateParents = (obj: any) => {
        const parent = obj && obj[Symbols.parent];
        if (parent) {
            parent[Symbols.now] = now;
            updateParents(parent);
        }
    }

    const hooks = {
        set: (target: any, prop: string | symbol, value: any, rec: any) => {
            const oldValue = target[prop];

            if (value && typeof value === "object" && !value[Symbols.now]) {
                value[Symbols.now] = now;
                value[Symbols.parent] = target;
                updateParents(value);
                target[prop] = new Proxy(value, hooks);
                proxier(value);
            } else if (
                value !== target[prop] &&
                typeof prop !== "symbol"
            ) {
                target[Symbols.now] = now;
                target[prop] = value;
                updateParents(target);
            } else if (
                prop === Symbols.parent
            ) {
                target[prop] = value;
                return true;
            } else {
                return true;
            }

            if (transactions[0]?.pending) {
                transactions[0].rollback.unshift(() => {
                    if (oldValue !== undefined) {
                        rec[prop] = oldValue;
                        rec[Symbols.now] = now;
                    } else {
                        delete target[prop];
                        rec[Symbols.now] = now;
                    }
                    updateParents(rec);
                });
            }

            if (!options?.disableTimer) {
                if (timer) {
                    clearTimeout(timer);
                }

                timer = setTimeout(() => {
                    now = Date.now();
                    eventTarget.dispatchEvent(
                        new CustomEvent<IDetail<Store>>("update", { detail: { store: initStore } })
                    );
                });
            }
            else {
                now = Date.now();
                eventTarget.dispatchEvent(
                    new CustomEvent<IDetail<Store>>("update", { detail: { store: initStore } })
                );
            }

            if (target[Symbols.root]) {
                eventTarget.dispatchEvent(
                    new CustomEvent<IDetail<Store>>("connected", { detail: { store: initStore, value } })
                );
            }

            return true;
        }
    };

    const proxier = (obj: Object) => {
        for (const key in obj) {
            let sub = obj[key];
            if (sub && typeof sub === "object" && typeof key !== "symbol") {
                if (sub[Symbols.parent]) {
                    sub[Symbols.parent] = obj;
                }
                else {
                    sub[Symbols.now] = now;
                    sub[Symbols.parent] = obj;
                    const proxy = new Proxy(sub, hooks);
                    obj[key] = proxy;
                    proxier(sub);
                }
            }
        }
    };

    initStore[Symbols.root] = true;
    const store: Store = new Proxy(initStore, hooks);
    proxier(initStore);

    const transaction = async (name: string, updater: Updater<Store>): Promise<ITransact<Store>> => {
        const doTransaction = async () => {
            if (transactions[0]?.pending || !transactions.length) {
                return;
            }

            const transaction = transactions[0];

            eventTarget.dispatchEvent(
                new CustomEvent<IDetail<Store>>("transactionstart", {
                    detail: { name: transaction.name, store, progress: transaction.progress }
                })
            );

            const progressCallback = (n: number) => {
                transaction.progress = n;
                eventTarget.dispatchEvent(
                    new CustomEvent<IDetail<Store>>("transactionprogress", { detail: { name: transaction.name, complete, store, progress: transaction.progress } })
                );
            }

            transaction.pending = true;
            const complete = await transaction.updater(store, progressCallback);
            transaction.pending = false;

            if (!complete) {
                eventTarget.dispatchEvent(
                    new CustomEvent<IDetail<Store>>("transactionaborted", { detail: { name: transaction.name, complete, store, progress: transaction.progress } })
                );
                transaction.rollback.forEach((rb: Rollback) => rb());
            }

            transaction.resolve({ name: transaction.name, complete, store });

            eventTarget.dispatchEvent(
                new CustomEvent<IDetail<Store>>("transactionend", {
                    detail: { name: transaction.name, complete, store, progress: transaction.progress }
                })
            );

            transactions.shift();
            doTransaction();
        };

        return new Promise((resolve) => {

            const transaction = { name, updater, resolve, rollback: [], pending: false, progress: 0, abort: null };

            const abort = (status: any) => {
                resolve({ name, complete: false, store, aborted: { status } });
                const idx = transactions.findIndex(t => t === transaction);

                eventTarget.dispatchEvent(
                    new CustomEvent<IDetail<Store>>("transactionaborted", { detail: { name: transaction.name, complete: false, store, progress: transaction.progress } })
                );

                transaction.rollback.forEach((rb: Rollback) => rb());
                transactions.splice(idx, 1);
                doTransaction();
            }

            transaction.abort = abort;

            transactions.push(transaction);

            eventTarget.dispatchEvent(
                new CustomEvent<IDetail<Store>>("addtransaction", {
                    detail: { name: name, complete: false, store, transactions, progress: 0 }
                })
            );

            doTransaction();
        });
    };

    const subscribe = (on: EventTypes, subscriber: EventHandler<Store>) =>
        eventTarget.addEventListener(on, subscriber);

    const unsubscribe = (on: string, subscriber: EventHandler<Store>) =>
        eventTarget.removeEventListener(on, subscriber);

    return { subscribe, unsubscribe, store, transaction, transactions };
};

export default raxy;