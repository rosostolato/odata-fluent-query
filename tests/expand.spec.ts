import { odataQuery } from '../src'
import { User } from '../models'

describe('testing ODataQuery expand', () => {
  // one2one relation
  test('expand', () => {
    const query = odataQuery<User>()
    const actual = query.expand('address').toString()
    const expected = '$expand=address'
    expect(actual).toBe(expected)
  })

  test('expand and select', () => {
    const query = odataQuery<User>()
    const actual = query.expand('address', q => q.select('code')).toString()

    const expected = '$expand=address($select=code)'
    expect(actual).toBe(expected)
  })

  test('expand twice', () => {
    const query = odataQuery<User>()
    const actual = query
      .expand('address', q => q.expand('user', q => q.select('id')))
      .toString()

    const expected = '$expand=address($expand=user($select=id))'
    expect(actual).toBe(expected)
  })

  // one2many relation
  test('expand and filter', () => {
    const query = odataQuery<User>()
    const actual = query
      .expand('posts', e => e.filter(q => q.content.startsWith('test')))
      .toString()

    const expected = "$expand=posts($filter=startswith(content, 'test'))"
    expect(actual).toBe(expected)
  })

  test('expand and filter composed', () => {
    const query = odataQuery<User>()
    const actual = query
      .expand('posts', e =>
        e.filter(q => q.content.startsWith('test').or(q.id.biggerThan(5)))
      )
      .toString()

    const expected =
      "$expand=posts($filter=startswith(content, 'test') or id gt 5)"
    expect(actual).toBe(expected)
  })

  test('expand and filter composed multiline', () => {
    const query = odataQuery<User>()
    const actual = query
      .expand('posts', e =>
        e
          .filter(q => q.content.startsWith('test').or(q.id.biggerThan(5)))
          .filter(q => q.id.lessThan(10))
      )
      .toString()

    const expected =
      "$expand=posts($filter=(startswith(content, 'test') or id gt 5) and id lt 10)"
    expect(actual).toBe(expected)
  })

  test('expand and orderby', () => {
    const query = odataQuery<User>()
    const actual = query
      .expand('posts', e => e.orderBy(q => q.id.desc()))
      .toString()

    const expected = '$expand=posts($orderby=id desc)'
    expect(actual).toBe(expected)
  })

  test('expand and paginate', () => {
    const query = odataQuery<User>()
    const actual = query.expand('posts', e => e.paginate(0)).toString()

    const expected = '$expand=posts($top=0;$count=true)'
    expect(actual).toBe(expected)
  })

  test('expand and paginate object', () => {
    const query = odataQuery<User>()
    const actual = query
      .expand('posts', e =>
        e.paginate({
          page: 5,
          pagesize: 10,
          count: false,
        })
      )
      .toString()

    const expected = '$expand=posts($skip=50;$top=10)'
    expect(actual).toBe(expected)
  })
})
