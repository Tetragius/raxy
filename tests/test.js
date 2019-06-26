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

mocha.describe('Test Symbol updated', () => {

    mocha.it('Check array element', () => {

        const { state, subscribe } = new Raxy({ a: 1, b: 2, c: [1, 2, 3, 4], d: [{ a: 1, b: 2 }, { a: 1, b: 2 }] });

        subscribe((s) => expect(s.c[3]).not.equal(4), state => ({ c: state.c }));
        subscribe((s) => expect(s.n).to.equal(5), state => ({ n: state.c[3] }));

        state.c[3] = 5;
    });

    mocha.it('Check object element', () => {

        const { state, subscribe } = new Raxy({ a: 1, b: 2, c: [1, 2, 3, 4], d: [{ a: 1, b: 2 }, { a: 1, b: 2 }] });

        subscribe((s) => expect(s.d[1].a).to.equal(4), state => ({ d: state.d }));
        subscribe((s) => expect(s.d.a).not.equal(1), state => ({ d: state.d[1] }));
        subscribe((s) => expect(s.n).to.equal(4), state => ({ n: state.d[1].a }));

        state.d[1].a = 4;
    });

});

mocha.describe('Test Symbol updated 2', () => {

    const { state, subscribe } = new Raxy({list: [{ label: 'item', isFinished: false }] });

    mocha.it('Check object element 1', () => {

        const s = subscribe((s) => expect(s.i.isFinished).to.equal(true), state => ({ i: state.list[0] }));

        state.list[0] = { label: 'item', isFinished: true };

        s.off();
    });

    mocha.it('Check object element 2', () => {

        subscribe((s) => expect(s.i.isFinished).to.equal(false), state => ({ i: state.list[0] }));

        state.list[0] = { label: 'item', isFinished: false };
    });

});

mocha.describe('Test append to array', () => {

    const { state, subscribe } = new Raxy({list: [{ label: 'item', isFinished: false }] });

    mocha.it('Check callstack', () => {

        subscribe((s) => expect(s.i).to.equal(2), state => ({ i: state.list.length }));

        state.list = [...state.list, { label: 'item 2', isFinished: true }];
    });

});

mocha.describe('Test delete', () => {

    const { state, subscribe } = new Raxy({
        list: [
            { label: 'item 1', isFinished: false },
            { label: 'item 2', isFinished: false },
            { label: 'item 3', isFinished: false, o: {a: 1} },
        ] });

    mocha.it('Check delete in array', () => {

        // const s1 = subscribe((s) => console.log(s), state => ({ i: state.list }));
        const s2 = subscribe((s) => expect(s.i).to.equal(2), state => ({ i: state.list.length }));

        delete state.list[1];

        // s1.off();
        s2.off();
    });

    mocha.it('Check delete in object', () => {

        const s = subscribe((s) => expect(s.i.o).to.equal(undefined), state => ({ i: state.list[1] }));

        delete state.list[1].o;

        s.off();
    });

});

// mocha.describe('Test array push', () => {

//     const { state, subscribe } = new Raxy({ list: [{item: 'item 1'}] });

//     mocha.it('Check array push', () => {

//         state.list.push({item: 'item 2'});

//         expect(state.list[0][Symbol.for('parent')]).not.equal(undefined);
//         expect(state.list[1][Symbol.for('parent')]).not.equal(undefined);

//     });

// });