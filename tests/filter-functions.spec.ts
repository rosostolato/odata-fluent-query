// import { ComplexFilterExpresion } from "../src/filter-builder"
import { makeExp } from '../src/functions/builders/create-filter'

describe('test filter expressions', () => {
  test('parentheses', () => {
    return expect(makeExp('exp').$$get()).toEqual('exp')
  })

  test('not expression', () => {
    return expect(makeExp('exp').not().$$get()).toEqual('not (exp)')
  })

  test('and expression', () => {
    return expect(makeExp('exp').and(makeExp('exp')).$$get()).toEqual(
      'exp and exp'
    )
  })

  test('or expression', () => {
    return expect(makeExp('exp').or(makeExp('exp')).$$get()).toEqual(
      'exp or exp'
    )
  })

  test('and expression inception', () => {
    return expect(makeExp('exp').and(makeExp('exp or exp')).$$get()).toEqual(
      'exp and (exp or exp)'
    )
  })

  test('or expression inception', () => {
    return expect(makeExp('exp').or(makeExp('exp or exp')).$$get()).toEqual(
      'exp or (exp or exp)'
    )
  })
})
