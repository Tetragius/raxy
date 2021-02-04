import { raxy } from '../src/index';
import chai from 'chai';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

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
});