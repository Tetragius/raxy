import 'custom-event-polyfill';

const EventTargetPolyfill = require('@ungap/event-target');
const ProxyPolyfillBuilder = require('es6-proxy-polyfill').default;

if (!window.EventTarget) {
    window.EventTarget = EventTargetPolyfill;
}

if (!window.Proxy) {
    window.Proxy = ProxyPolyfillBuilder;
}