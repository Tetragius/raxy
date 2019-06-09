const mocha = require('mocha');
const chai = require('chai');
const Raxy = require('../dist/index.js').default;

const expect = chai.expect;

mocha.describe('Test subscribe method', () => {
    mocha.it('Check subscriber', () => {

        const store = new Raxy({ a: 1, b: 2 });

        store.subscribe((s) => expect(s.a).to.equal(2), state => ({ a: state.a }));

        store.state.a = 2;
    });

    mocha.it('Check subscriber work only fired', () => {

        const store = new Raxy({ a: 1, b: 1 });

        store.subscribe((s) => expect(s).to.equal(2), state => ({ b: state.b }));

        store.state.a = 2;
    });
});

mocha.describe('Test assign', () => {
    mocha.it('Check subscriber', () => {

        const store = new Raxy({ a: 1, b: 2, nested: { c: 3, nested: { d: 4 } }, nestedAgain: { e: 5 } });

        store.subscribe((s) => expect(s.c).to.equal(4), state => ({ c: state.nested.c }));

        const action = (c, e) => {
            const state = Object.assign({}, store.state);
            state.nested.c = c;
            state.nestedAgain.e = e;
            Object.assign(store.state, state);
        }

        action(4, 5);
    });

    mocha.it('Check subscriber work only fired', () => {

        const store = new Raxy({ a: 1, b: 2, nested: { c: 3, nested: { d: 4 } }, nestedAgain: { e: 5 } });

        store.subscribe((s) => expect(s).to.equal(3), state => ({ d: state.nested.nested.d }));

        const action = (c, e) => {
            const state = Object.assign({}, store.state);
            state.nested.c = c;
            state.nestedAgain.e = e;
            Object.assign(store.state, state);
        }

        action(4, 5);
    });
});