!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e(require("react")):"function"==typeof define&&define.amd?define(["react"],e):"object"==typeof exports?exports.raxy=e(require("react")):t.raxy=e(t.react)}(window,function(t){return function(t){var e={};function r(o){if(e[o])return e[o].exports;var s=e[o]={i:o,l:!1,exports:{}};return t[o].call(s.exports,s,s.exports,r),s.l=!0,s.exports}return r.m=t,r.c=e,r.d=function(t,e,o){r.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:o})},r.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},r.t=function(t,e){if(1&e&&(t=r(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var o=Object.create(null);if(r.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var s in t)r.d(o,s,function(e){return t[e]}.bind(null,s));return o},r.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="",r(r.s=1)}([function(e,r){e.exports=t},function(t,e,r){t.exports=r(2)},function(t,e,r){"use strict";r.r(e);var o=r(0),s=r.n(o);function n(){return(n=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var r=arguments[e];for(var o in r)Object.prototype.hasOwnProperty.call(r,o)&&(t[o]=r[o])}return t}).apply(this,arguments)}function i(t,e,r,o){const s={set:(t,e,r)=>(t[e]&&t[e]!==r&&(n.needToUpdate=!0),t[e]=r,!0)},n={updater:r,state:(t=>"object"==typeof t?new Proxy(t,s):t)(o(t)),mapper:o,needToUpdate:!1,wrapper:null};return e.push(n),n}r.d(e,"default",function(){return u});class u{constructor(t){this.state=null,this.proxyMap=new Map,this.subscribers=[],this.hooks={set:(t,e,r,o)=>(t[e]!==r&&("object"==typeof t[e]||Array.isArray(t[e])?t[e]=this.proxyer(r):t[e]=r,this.subscribers.some(t=>{const e=t.state;for(const t in e)if(e[t]&&e[t]===o){for(const t in this.state)this.state[t]&&this.state[t]===o&&(this.state[t]=this.proxyer(o));return!0}const r=t.mapper(this.store);return Object.assign(e,r),t.needToUpdate&&t.updater(e,()=>t.needToUpdate=!1),!1})),!0)},this.store=null,this.connect=((t,e)=>{let r;return function(t,e,r){return class extends s.a.Component{constructor(t){super(t)}componentWillMount(){const t=e(this,this.setState.bind(this));this.setState(t.state)}componentWillUnmount(){r(this)}render(){return s.a.createElement(t,n({},this.state,this.props))}}}(t,(t,o)=>((r=i(this.store,this.subscribers,o,e)).wrapper=t,r),t=>this.disposal(e=>e.wrapper!==t))}),this.subscribe=((t,e)=>{let r;const o=(e,r)=>{t(e),r()},s=()=>r=i(this.store,this.subscribers,o,e);s();return{off:()=>this.disposal(t=>t!==r),on:()=>s()}}),this.disposal=(t=>{this.subscribers=this.subscribers.filter(t)}),this.proxyer=(t=>{if(this.proxyMap.has(t)){const e=this.proxyMap.get(t);this.proxyMap.delete(t),t=e.obj,e.revoke()}for(const e in t)(t[e]&&"object"==typeof t[e]||Array.isArray(t[e]))&&(t[e]=this.proxyer(t[e]));const{proxy:e,revoke:r}=Proxy.revocable(t,this.hooks);return this.proxyMap.set(e,{revoke:r,obj:t}),e}),this.store={...t},this.state=this.proxyer(this.store)}}}])});