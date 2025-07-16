import { getFuncArgs, makeExp } from '../src/builders/create-filter'

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

describe('getFuncArgs', () => {
  it('should return the arguments of a function', () => {
    const fn = function (a: number, b: number) {
      return a + b
    }
    return expect(getFuncArgs(fn)).toEqual(['a', 'b'])
  })

  it('should return the arguments of an arrow function', () => {
    const fn: (a: any) => any = a => a
    return expect(getFuncArgs(fn)).toEqual(['a'])
  })

  it('should return the arguments of an arrow function 2', () => {
    const fn: (p: any) => any = p => p.comments.any((c: any) => c.equals(null))
    return expect(getFuncArgs(fn)).toEqual(['p'])
  })

  it('should return the arguments of an arrow function 3', () => {
    const fn = (a: number, b: number) => a + b
    return expect(getFuncArgs(fn)).toEqual(['a', 'b'])
  })
})

describe('getFuncArgs edge cases', () => {
  it('should handle malformed function strings', () => {
    // Create a function that might not match the regex pattern
    const malformedFunc = () => {}
    // Monkey patch toString to return something that won't match regex
    malformedFunc.toString = () => 'invalid'

    const result = getFuncArgs(malformedFunc)
    expect(result).toEqual([''])
  })
})
