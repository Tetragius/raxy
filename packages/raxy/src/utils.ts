import { IRaxy } from "./core";

export const snapshot = (data: any) => JSON.parse(JSON.stringify(data))

const dt = { devTools: null, disableLogger: false, logger: false }

export const logger = (subscribe: IRaxy<any>['subscribe']) => {
    if (dt.logger) {
        return;
    }
    dt.logger = true;
    subscribe("update", (e) => {
        const snap = snapshot(e.detail);
        console.log(
            "🐶 %cupdated",
            "color: white; background-color: #8dc149; padding: 4px; border-radius: 4px; text-align: center;",
            snap
        );
        if (!dt.disableLogger) {
            dt.devTools?.send(`anonymous change`, snap.store);
        }
        dt.disableLogger = false;
    });
    subscribe("transactionstart", (e) => {
        const snap = snapshot(e.detail);
        console.log(
            "🐶 %ctransaction start: ",
            "color: white; background-color: #5b7add; padding: 4px; border-radius: 4px; text-align: center;",
            snap
        );
    });
    subscribe("transactionend", (e) => {
        const snap = snapshot(e.detail);
        console.log(
            "🐶 %ctransaction end: ",
            "color: white; background-color: #5b7add; padding: 4px; border-radius: 4px; text-align: center;",
            snap
        );
        if (e.detail.transaction?.name !== "DEV-TOOLS") {
            dt.devTools?.send(`transaction change: ${e.detail.transaction?.name}`, snap.store);
        }
    });
    // no dev-tool
    subscribe("addtransaction", (e) => {
        const snap = snapshot(e.detail);
        console.log(
            "🐶 %cadd transaction: ",
            "color: white; background-color: #5b7add; padding: 4px; border-radius: 4px; text-align: center;",
            snap
        );
    });
    subscribe("transactionaborted", (e) => {
        const snap = snapshot(e.detail);
        console.log(
            "🐶 %cabort transaction: ",
            "color: white; background-color: #dd5b5b; padding: 4px; border-radius: 4px; text-align: center;",
            snap
        );
    });
    subscribe("transactionprogress", (e) => {
        const snap = snapshot(e.detail);
        console.log(
            "🐶 %ctransaction in progress: ",
            "color: white; background-color: #5b7add; padding: 4px; border-radius: 4px; text-align: center;",
            snap
        );
    });
    subscribe("connected", (e) => {
        const snap = snapshot(e.detail);
        console.log(
            "🐶 %cconnect new store: ",
            "color: white; background-color: #5b7add; padding: 4px; border-radius: 4px; text-align: center;",
            snap
        );
    });
}

export const connectDevTools = (instanse: IRaxy<any>) => {
    if (!dt.logger) {
        logger(instanse.subscribe)
    }
    // @ts-ignore
    dt.devTools = window.__REDUX_DEVTOOLS_EXTENSION__?.connect({});
    dt.devTools?.init(snapshot(instanse.store));
    dt.devTools?.subscribe((data: any) => {
        instanse.transaction("DEV-TOOLS", async (store) => {
            dt.disableLogger = true;
            data.state && Object.assign(store, JSON.parse(data.state));
            return true;
        });
    });
}