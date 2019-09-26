import { ComplexFilterExpresion, FilterExpresionUnit } from "../src/filterbuilder"

describe('test filter expressions', () => {
  test('parentheses', () => expect(new ComplexFilterExpresion('expr').GetFilterExpresion()).toEqual('(expr)'))
  test('not expr', () => expect(new ComplexFilterExpresion('expr').Not().GetFilterExpresion()).toEqual('(not (expr))'))
  test('and expr', () => expect(new ComplexFilterExpresion('expr').And(new ComplexFilterExpresion('expr')).GetFilterExpresion()).toEqual('((expr) and (expr))'))
  test('or expr', () => expect(new ComplexFilterExpresion('expr').Or(new ComplexFilterExpresion('expr')).GetFilterExpresion()).toEqual('((expr) or (expr))'))
})

describe('test unit expression', () => {
  test('kind', () => expect(new FilterExpresionUnit().kind).toEqual('none'))
  test('not expr', () => expect(new FilterExpresionUnit().Not().kind).toEqual('none'))
  test('and expr', () => expect((new FilterExpresionUnit()).And(new ComplexFilterExpresion('expr')).GetFilterExpresion()).toEqual('(expr)'))
  test('or expr', () => expect((new FilterExpresionUnit()).And(new ComplexFilterExpresion('expr')).GetFilterExpresion()).toEqual('(expr)'))
})