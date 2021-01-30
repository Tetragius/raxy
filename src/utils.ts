import { IRaxy } from "./core";

export const snapshot = (data: any) => JSON.parse(JSON.stringify(data))

const dt = { devTools: null, disableLogger: false }

export const logger = (subscribe: IRaxy<any>['subscribe']) => {
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
        if (e.detail.name !== "DEV-TOOLS") {
            dt.devTools?.send(`transaction change: ${e.detail.name}`, snap.store);
        }
    });
}

export const connectDevTools = (instanse: IRaxy<any>) => {
    const devTools = window.__REDUX_DEVTOOLS_EXTENSION__?.connect({});
    devTools?.init(snapshot(instanse.store));
    devTools?.subscribe((data: any) => {
        instanse.transaction("DEV-TOOLS", async (store) => {
            dt.disableLogger = true;
            data.state && Object.assign(store, JSON.parse(data.state));
            return true;
        });
    });
}