import { makeExp } from '../src/builders'

describe('test filter expressions', () => {
  it('parentheses', () => {
    return expect(makeExp('exp')._get()).toEqual('exp')
  })

  it('not expression', () => {
    return expect(makeExp('exp').not()._get()).toEqual('not (exp)')
  })

  it('and expression', () => {
    return expect(makeExp('exp').and(makeExp('exp'))._get()).toEqual(
      'exp and exp'
    )
  })

  it('or expression', () => {
    return expect(makeExp('exp').or(makeExp('exp'))._get()).toEqual(
      'exp or exp'
    )
  })

  it('and expression inception', () => {
    return expect(makeExp('exp').and(makeExp('exp or exp'))._get()).toEqual(
      'exp and (exp or exp)'
    )
  })

  it('or expression inception', () => {
    return expect(makeExp('exp').or(makeExp('exp or exp'))._get()).toEqual(
      'exp or (exp or exp)'
    )
  })
})
