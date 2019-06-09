const mocha = require('mocha');
const chai = require('chai');
const Raxy = require('../dist/index.js').default;

const expect = chai.expect;

console.log(expect);

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