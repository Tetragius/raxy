import 'custom-event-polyfill';

const EventTargetPolyfill = require('@ungap/event-target').default;
const ProxyPolyfillBuilder = require('es6-proxy-polyfill').default;

export const polyfillIE = () => {
    if (!window.EventTarget) {
        window.EventTarget = EventTargetPolyfill;
    }

    if (!window.Proxy) {
        window.Proxy = ProxyPolyfillBuilder;
    }
}