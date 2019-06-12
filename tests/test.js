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

mocha.describe('Test unsubscribe and resubscribe methods', () => {

    const store = new Raxy({ a: 1, b: 2 });
    const subscriber = store.subscribe((s) => expect(s.a).to.equal(2), state => ({ a: state.a }));

    mocha.it('Check subscriber', () => {
        store.state.a = 2;
    });

    mocha.it('Check unsubscribe', () => {
        subscriber.off();
        store.state.a = 3;
    });

    mocha.it('Check resubscribe', () => {
        subscriber.on();
        store.state.a = 2;
    });
});

mocha.describe('Test Arrays', () => {

    mocha.it('Check subscriber element', () => {

        const { state, subscribe } = new Raxy({ a: 1, b: 2, c: [1, 2, 3, 4], d: [{ a: 1, b: 2 }, { a: 1, b: 2 }] });

        subscribe((s) => expect(s.a).to.equal(2), state => ({ a: state.a }));
        subscribe((s) => expect(s.a).not.equal(1), state => ({ a: state.a }));

        state.a = 2;
    });

    mocha.it('Check arrays proxy', () => {

        const { state, subscribe } = new Raxy({ a: 1, b: 2, c: [1, 2, 3, 4], d: [{ a: 1, b: 2 }, { a: 1, b: 2 }] });

        subscribe((s) => expect(s.a[1]).to.equal(3), state => ({ a: state.c }));
        subscribe((s) => expect(s.a).to.equal(3), state => ({ a: state.c[1] }));
        subscribe((s) => expect(s.a).not.equal(2), state => ({ a: state.c[1] }));

        state.c[1] = 3;
    });

});
