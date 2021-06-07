import Symbols from './symbols';

export type Abort = (status: any) => void;
export type Progress<S> = {
    (n: number): void;
    target: ITransaction<S>;
    prev: ITransaction<S>;
}
export type Rollback = () => void;
export type Updater<S> = (store: S, progress: Progress<S>) => Promise<boolean>;
export type Resolver<S> = (data: ITransaction<S>) => void;
export type Transaction<S> = (name: string, updater: Updater<S>) => Promise<ITransaction<S>>
export type EventHandler<S> = (event: CustomEvent<IDetail<S>>) => void;

export type EventTypes = 'update' | 'transactionstart' | 'transactionend' | 'addtransaction' | 'transactionaborted' | 'transactionprogress' | 'connected';

export interface IDetail<S> {
    store: S;
    transactions?: ITransaction<S>[];
    transaction?: ITransaction<S>;
    value?: any;
}

export interface IRaxyOptions {
    disableTimer?: boolean;
}

export interface ITransaction<S> {
    name: string;
    pending: boolean;
    aborted?: any;
    progress: number;
    rollback: Rollback[];
    store: S;
    updater: Updater<S>;
    resolve?: Resolver<S>
    abort: Abort;
}

export interface IRaxy<S> {
    store: S;
    transactions: ITransaction<S>[]
    subscribe(on: EventTypes, subscriber: EventHandler<S>): void;
    unsubscribe(on: EventTypes, subscriber: EventHandler<S>): void;
    transaction: Transaction<S>;
}

export const raxy = <Store = any>(initStore: Store, options?: IRaxyOptions): IRaxy<Store> => {
    const eventTarget = new EventTarget();
    const transactions: ITransaction<Store>[] = [];
    let timer: NodeJS.Timeout = null;
    let now = performance.now();

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
                    now = performance.now();
                    eventTarget.dispatchEvent(
                        new CustomEvent<IDetail<Store>>("update", { detail: { store: initStore } })
                    );
                }, 30);
            }
            else {
                now = performance.now();
                eventTarget.dispatchEvent(
                    new CustomEvent<IDetail<Store>>("update", { detail: { store: initStore } })
                );
            }

            if (target[Symbols.root] && typeof value === 'object') {
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
                if (!sub[Symbols.parent]) {
                    sub[Symbols.now] = now;
                    sub[Symbols.parent] = obj;
                    sub[Symbols.original] = sub;
                    const proxy = new Proxy(sub, hooks);
                    obj[key] = proxy;
                    proxier(sub);
                }
            }
        }
    };

    // init
    initStore[Symbols.root] = true;
    const store: Store = new Proxy(initStore, hooks);
    proxier(initStore);
    now = performance.now();
    //init end

    const transaction = async (name: string, updater: Updater<Store>): Promise<ITransaction<Store>> => {

        const transaction: ITransaction<Store> = { name, pending: false, aborted: false, progress: 0, rollback: [], store, updater, abort: null, resolve: null };

        const doTransaction = async (prevTransaction: ITransaction<Store>) => {
            if (transactions[0]?.pending || !transactions.length) {
                return;
            }

            const transaction = transactions[0];

            eventTarget.dispatchEvent(
                new CustomEvent<IDetail<Store>>("transactionstart", {
                    detail: { store, transaction }
                })
            );

            const progressCallback = (n: number) => {
                transaction.progress = n;
                eventTarget.dispatchEvent(
                    new CustomEvent<IDetail<Store>>("transactionprogress", { detail: { store, transaction } })
                );
            }

            progressCallback.target = transaction;
            progressCallback.prev = prevTransaction;

            transaction.pending = true;
            try {
                const complete = await transaction.updater(transaction.store, progressCallback);
                transaction.pending = false;

                if (!complete && !transaction.aborted) {
                    eventTarget.dispatchEvent(
                        new CustomEvent<IDetail<Store>>("transactionaborted", { detail: { store, transaction } })
                    );
                    transaction.rollback.forEach((rb: Rollback) => rb());
                }

                if (!transaction.aborted) {
                    transaction.resolve(transaction);

                    eventTarget.dispatchEvent(
                        new CustomEvent<IDetail<Store>>("transactionend", {
                            detail: { store, transaction }
                        })
                    );
                }
            }
            catch {
                // abort
            }
            finally {
                if (!transaction.pending) {
                    transactions.shift();
                    doTransaction(transaction);
                }
            }

        };

        return new Promise((resolve, reject) => {

            transaction.resolve = resolve;

            try {
                const abort = (status: any) => {
                    transaction.store = undefined;
                    transaction.aborted = status;
                    resolve(transaction);
                    const idx = transactions.findIndex(t => t === transaction);

                    eventTarget.dispatchEvent(
                        new CustomEvent<IDetail<Store>>("transactionaborted", { detail: { store, transaction } })
                    );

                    transaction.rollback.forEach((rb: Rollback) => rb());
                    transactions.splice(idx, 1);
                    doTransaction(transaction);
                }

                transaction.abort = abort;

                transactions.push(transaction);

                eventTarget.dispatchEvent(
                    new CustomEvent<IDetail<Store>>("addtransaction", {
                        detail: { store, transaction, transactions }
                    })
                );

                doTransaction(transaction);
            }
            catch (e) {
                reject(transaction);
            }
        });
    };

    const subscribe = (on: EventTypes, subscriber: EventHandler<Store>) =>
        eventTarget.addEventListener(on, subscriber);

    const unsubscribe = (on: string, subscriber: EventHandler<Store>) =>
        eventTarget.removeEventListener(on, subscriber);

    return { subscribe, unsubscribe, store, transaction, transactions };
};

export default raxy;