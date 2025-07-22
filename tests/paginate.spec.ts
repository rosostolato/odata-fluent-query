import { odataQuery } from '../src'
import { User } from './data/user'

describe('testing ODataQuery paginate', () => {
  it('paginate', () => {
    const query = odataQuery<User>()
    const actual = query.paginate(10).toString()
    const expected = '$top=10&$count=true'
    expect(actual).toBe(expected)
  })

  it('paginate with skip', () => {
    const query = odataQuery<User>()
    const actual = query.paginate(25, 5).toString()
    const expected = '$skip=125&$top=25&$count=true'
    expect(actual).toBe(expected)
  })

  it('paginate object', () => {
    const query = odataQuery<User>()
    const actual = query.paginate({ pagesize: 10 }).toString()
    const expected = '$top=10&$count=true'
    expect(actual).toBe(expected)
  })

  it('paginate object with skip', () => {
    const query = odataQuery<User>()
    const actual = query.paginate({ page: 5, pagesize: 25 }).toString()
    const expected = '$skip=125&$top=25&$count=true'
    expect(actual).toBe(expected)
  })

  it('paginate disable count', () => {
    const query = odataQuery<User>()
    const actual = query
      .paginate({ page: 5, pagesize: 25, count: false })
      .toString()
    const expected = '$skip=125&$top=25'
    expect(actual).toBe(expected)
  })

  it('paginate with page 0 (no skip)', () => {
    const query = odataQuery<User>()
    const actual = query.paginate(5, 0).toString()
    const expected = '$top=5&$count=true'
    expect(actual).toBe(expected)
  })

  it('paginate with explicit zero skip', () => {
    const query = odataQuery<User>()
    const actual = query.paginate({ pagesize: 10, page: 0 }).toString()
    const expected = '$top=10&$count=true'
    expect(actual).toBe(expected)
  })

  it('paginate with explicit count true', () => {
    const query = odataQuery<User>()
    const actual = query
      .paginate({ pagesize: 15, page: 2, count: true })
      .toString()
    const expected = '$skip=30&$top=15&$count=true'
    expect(actual).toBe(expected)
  })

  it('paginate with count null', () => {
    const query = odataQuery<User>()
    const actual = query
      .paginate({ pagesize: 10, page: 1, count: null as any })
      .toString()
    const expected = '$skip=10&$top=10'
    expect(actual).toBe(expected)
  })
})
