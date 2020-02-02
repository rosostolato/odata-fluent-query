import { ComplexFilterExpresion } from "../src/filterbuilder"

describe('test filter expressions', () => {
  test('parentheses', () => expect(new ComplexFilterExpresion('expr').getFilterExpresion()).toEqual('expr'))
  test('not expr', () => expect(new ComplexFilterExpresion('expr').not().getFilterExpresion()).toEqual('not (expr)'))
  test('and expr', () => expect(new ComplexFilterExpresion('expr').and(new ComplexFilterExpresion('expr')).getFilterExpresion()).toEqual('expr and expr'))
  test('or expr', () => expect(new ComplexFilterExpresion('expr').or(new ComplexFilterExpresion('expr')).getFilterExpresion()).toEqual('expr or expr'))
  test('and expr inception', () => expect(new ComplexFilterExpresion('expr').and(new ComplexFilterExpresion('expr or expr')).getFilterExpresion()).toEqual('expr and (expr or expr)'))
  test('or expr inception', () => expect(new ComplexFilterExpresion('expr').or(new ComplexFilterExpresion('expr or expr')).getFilterExpresion()).toEqual('expr or (expr or expr)'))
});
