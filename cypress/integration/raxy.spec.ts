import { raxy, createConnector } from '../../packages/raxy/src/index';

describe('Raxy', function () {

    describe('Create', function () {

        it('create store - object', function () {
            raxy({ a: 1, b: 2, c: 3 });
        });

        it('create store - array', function () {
            raxy([1, 2, 3]);
        });

        it('create store - nested', function () {
            raxy({ a: 1, obj: { a: 1, b: 2 } });
            raxy({ a: 1, arr: [1, 2, 3] });
            raxy({ a: 1, obj: { a: 1, b: 2 }, arr: [1, 2, 3] });
            raxy([{ a: 1, obj: { a: 1, b: 2 } }, { a: 1, obj: { a: 1, b: 2 }, arr: [1, 2, 3] }, { a: 1, arr: [1, 2, 3] }]);
        });
    });

    describe('Update primitives', function () {

        it('Array', function () {
            const cb = cy.spy();
            const instanse = createConnector({ arr: [] });
            const connector = instanse.connect(cb, (store) => ({ arr: store.arr }));
            connector.mountCallback();
            instanse.store.arr.push({ id: 1 });
            cy.wait(1).then(() => {
                expect(cb).has.been.calledOnce;
            });
        });

        it('Object', function () {
            const cb = cy.spy();
            const instanse = createConnector({ obj: {} });
            const connector = instanse.connect(cb, (store) => ({ obj: store.obj }));
            connector.mountCallback();
            instanse.store.obj['a'] = 1;
            cy.wait(1).then(() => {
                expect(cb).has.been.calledOnce;
            });
        });

        it('Number: from zero to not zero', function () {
            const cb = cy.spy();
            const instanse = createConnector({ a: 0 });
            const connector = instanse.connect(cb, (store) => ({ a: store.a }));
            connector.mountCallback();
            instanse.store.a = 1;
            cy.wait(1).then(() => {
                expect(cb).has.been.calledOnce;
            });
        });

        it('Number: from not zero to zero', function () {
            const cb = cy.spy();
            const instanse = createConnector({ a: 1 });
            const connector = instanse.connect(cb, (store) => ({ a: store.a }));
            connector.mountCallback();
            instanse.store.a = 0;
            cy.wait(1).then(() => {
                expect(cb).has.been.calledOnce;
            });
        });

        it('Number from not zero to not zero ', function () {
            const cb = cy.spy();
            const instanse = createConnector({ a: 1 });
            const connector = instanse.connect(cb, (store) => ({ a: store.a }));
            connector.mountCallback();
            instanse.store.a = 2;
            cy.wait(1).then(() => {
                expect(cb).has.been.calledOnce;
            });
        });

        it('Number from 1 to 1 ', function () {
            const cb = cy.spy();
            const instanse = createConnector({ a: 1 });
            const connector = instanse.connect(cb, (store) => ({ a: store.a }));
            connector.mountCallback();
            instanse.store.a = 1;
            cy.wait(1).then(() => {
                expect(cb).has.not.called;
            });
        });

        it('String: from empty to not empty', function () {
            const cb = cy.spy();
            const instanse = createConnector({ a: '' });
            const connector = instanse.connect(cb, (store) => ({ a: store.a }));
            connector.mountCallback();
            instanse.store.a = 'test';
            cy.wait(1).then(() => {
                expect(cb).has.been.calledOnce;
            });
        });

        it('String: from not empty to empty', function () {
            const cb = cy.spy();
            const instanse = createConnector({ a: 'test' });
            const connector = instanse.connect(cb, (store) => ({ a: store.a }));
            connector.mountCallback();
            instanse.store.a = '';
            cy.wait(1).then(() => {
                expect(cb).has.been.calledOnce;
            });
        });

        it('String: from not empty to not empty', function () {
            const cb = cy.spy();
            const instanse = createConnector({ a: 'test 1' });
            const connector = instanse.connect(cb, (store) => ({ a: store.a }));
            connector.mountCallback();
            instanse.store.a = 'test 2';
            cy.wait(1).then(() => {
                expect(cb).has.been.calledOnce;
            });
        });

        it('String: from "test" to "test"', function () {
            const cb = cy.spy();
            const instanse = createConnector({ a: 'test' });
            const connector = instanse.connect(cb, (store) => ({ a: store.a }));
            connector.mountCallback();
            instanse.store.a = 'test';
            cy.wait(1).then(() => {
                expect(cb).has.not.called;
            });
        });

        it('Boolean: from false', function () {
            const cb = cy.spy();
            const instanse = createConnector({ a: false });
            const connector = instanse.connect(cb, (store) => ({ a: store.a }));
            connector.mountCallback();
            instanse.store.a = true;
            cy.wait(1).then(() => {
                expect(cb).has.been.calledOnce;
            });
        });

        it('Boolean: from true', function () {
            const cb = cy.spy();
            const instanse = createConnector({ a: true });
            const connector = instanse.connect(cb, (store) => ({ a: store.a }));
            connector.mountCallback();
            instanse.store.a = false;
            cy.wait(1).then(() => {
                expect(cb).has.been.calledOnce;
            });
        });

        it('From null', function () {
            const cb = cy.spy();
            const instanse = createConnector({ a: null });
            const connector = instanse.connect(cb, (store) => ({ a: store.a }));
            connector.mountCallback();
            instanse.store.a = 1;
            cy.wait(1).then(() => {
                expect(cb).has.been.calledOnce;
            });
        });

        it('From undefined', function () {
            const cb = cy.spy();
            const instanse = createConnector({ a: undefined });
            const connector = instanse.connect(cb, (store) => ({ a: store.a }));
            connector.mountCallback();
            instanse.store.a = 1;
            cy.wait(1).then(() => {
                expect(cb).has.been.calledOnce;
            });
        });
    });

    describe('Update complex', function () {

        it('Object and Array', function () {
            const cb = cy.spy();
            const instanse = createConnector({ obj: {}, arr: [] });
            const connector = instanse.connect(cb, (store) => ({ arr: store.arr }));
            connector.mountCallback();
            instanse.store.arr.push({ id: 1 });
            cy.wait(1).then(() => {
                expect(cb).has.been.calledOnce;
            });
        });

        it('Object and Array + primitive', function () {
            const cb = cy.spy();
            const instanse = createConnector({ a: {}, b: [], c: null });
            const connector = instanse.connect(cb, (store) => ({ b: store.b }));
            connector.mountCallback();
            instanse.store.b.push({ id: 1 });
            cy.wait(1).then(() => {
                expect(cb).has.been.calledOnce;
            });
        });

        it('Object and Array with optimisation not.called', function () {
            const cb = cy.spy();
            const { connect } = createConnector({ obj: {}, arr: [] });
            const { mountCallback, store } = connect(
                cb,
                (store) => ({ arr: store.arr }),
                {
                    arr: { ignoreTimeStamp: true }
                });
            mountCallback();
            store.arr.push({ id: 1 });
            cy.wait(1).then(() => {
                expect(cb).has.not.called;
            });
        });

        it('Object and Array with optimisation called for Array', function () {
            const cb = cy.spy();
            const { connect } = createConnector({ obj: {}, arr: [] });
            const { mountCallback, store } = connect(
                cb,
                (store) => ({ arr: store.arr, len: store.arr.length }),
                {
                    arr: { ignoreTimeStamp: true }
                });
            mountCallback();
            store.arr.push({ id: 1 });
            setTimeout(() => {
                store.arr[0].id = 2;
            }, 10);
            setTimeout(() => {
                store.arr[0].id = 3;
            }, 20);
            cy.wait(100).then(() => {
                expect(cb).has.been.calledOnce;
            });
        });

        it('Object and Array with optimisation called for Object', function () {
            const cb = cy.spy();
            const { connect } = createConnector({ obj: { a: 1 }, arr: [] });
            const { mountCallback, store } = connect(
                cb,
                (store) => ({ arr: store.arr, a: store.obj.a }),
                {
                    arr: { ignoreTimeStamp: true }
                });
            mountCallback();
            store.arr.push({ id: 1 });
            setTimeout(() => {
                store.arr[0].id = 2;
            }, 10);
            setTimeout(() => {
                store.arr[0].id = 3;
            }, 20);
            cy.wait(100).then(() => {
                expect(cb).has.not.called;
            });
        });

        it('Object and Array with optimisation called for Array with getter', function () {
            const cb = cy.spy();
            const { connect } = createConnector({ obj: {}, arr: [] });
            const { mountCallback, store } = connect(
                cb,
                (store) => ({ arr: store.arr, get len() { return store.arr.length; } }),
                {
                    arr: { ignoreTimeStamp: true }
                });
            mountCallback();
            store.arr.push({ id: 1 });
            setTimeout(() => {
                store.arr[0].id = 2;
            }, 10);
            setTimeout(() => {
                store.arr.push({ id: 2 });
            }, 20);
            cy.wait(100).then(() => {
                expect(cb).has.been.calledTwice;
            });
        });

        it('Object and Array with optimisation called for Array with getter', function () {
            const cb = cy.spy();
            const { connect } = createConnector({ obj: { a: 1 }, arr: [] });
            const { mountCallback, store } = connect(
                cb,
                (store) => ({ arr: store.arr, get len() { return this?.arr?.length; } }),
                {
                    arr: { ignoreTimeStamp: true }
                });
            mountCallback();
            store.arr.push({ id: 1 });
            setTimeout(() => {
                store.arr[0].id = 2;
            }, 10);
            setTimeout(() => {
                store.arr.push({ id: 2 });
            }, 20);
            setTimeout(() => {
                store.obj.a = 2;
            }, 30);
            setTimeout(() => {
                store.obj.a = 3;
            }, 40);
            cy.wait(100).then(() => {
                expect(cb).has.been.calledTwice;
            });
        });
    });
});