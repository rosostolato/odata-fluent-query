"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var builders_1 = require("../src/builders");
describe('test filter expressions', function () {
    it('parentheses', function () {
        return expect((0, builders_1.makeExp)('exp')._get()).toEqual('exp');
    });
    it('not expression', function () {
        return expect((0, builders_1.makeExp)('exp').not()._get()).toEqual('not (exp)');
    });
    it('and expression', function () {
        return expect((0, builders_1.makeExp)('exp').and((0, builders_1.makeExp)('exp'))._get()).toEqual('exp and exp');
    });
    it('or expression', function () {
        return expect((0, builders_1.makeExp)('exp').or((0, builders_1.makeExp)('exp'))._get()).toEqual('exp or exp');
    });
    it('and expression inception', function () {
        return expect((0, builders_1.makeExp)('exp').and((0, builders_1.makeExp)('exp or exp'))._get()).toEqual('exp and (exp or exp)');
    });
    it('or expression inception', function () {
        return expect((0, builders_1.makeExp)('exp').or((0, builders_1.makeExp)('exp or exp'))._get()).toEqual('exp or (exp or exp)');
    });
});
//# sourceMappingURL=filter-functions.spec.js.map