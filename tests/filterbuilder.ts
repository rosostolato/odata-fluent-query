import { ComplexFilterExpresion, FilterExpresionUnit } from "../src/filterbuilder"

describe('test filter expressions', () => {
  test('parentheses', () => expect(new ComplexFilterExpresion('expr').getFilterExpresion()).toEqual('(expr)'))
  test('not expr', () => expect(new ComplexFilterExpresion('expr').not().getFilterExpresion()).toEqual('(not (expr))'))
  test('and expr', () => expect(new ComplexFilterExpresion('expr').and(new ComplexFilterExpresion('expr')).getFilterExpresion()).toEqual('((expr) and (expr))'))
  test('or expr', () => expect(new ComplexFilterExpresion('expr').or(new ComplexFilterExpresion('expr')).getFilterExpresion()).toEqual('((expr) or (expr))'))
})

describe('test unit expression', () => {
  test('kind', () => expect(new FilterExpresionUnit().kind).toEqual('none'))
  test('not expr', () => expect(new FilterExpresionUnit().not().kind).toEqual('none'))
  test('and expr', () => expect((new FilterExpresionUnit()).and(new ComplexFilterExpresion('expr')).getFilterExpresion()).toEqual('(expr)'))
  test('or expr', () => expect((new FilterExpresionUnit()).and(new ComplexFilterExpresion('expr')).getFilterExpresion()).toEqual('(expr)'))
})