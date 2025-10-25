import { odataQuery } from '../src'
import { User } from './data/user'

describe('testing ODataQuery expand', () => {
  it('expand', () => {
    const query = odataQuery<User>()
    const actual = query.expand('manager').toString()
    const expected = '$expand=manager'
    expect(actual).toBe(expected)
  })

  it('expand and select', () => {
    const query = odataQuery<User>()
    const actual = query.expand('manager', q => q.select('email')).toString()
    const expected = '$expand=manager($select=email)'
    expect(actual).toBe(expected)
  })

  it('expand and select optional', () => {
    const query = odataQuery<User>()
    const actual = query
      .expand('posts', q => q.select('id', 'title'))
      .toString()
    const expected = '$expand=posts($select=id,title)'
    expect(actual).toBe(expected)
  })

  it('expand twice', () => {
    const query = odataQuery<User>()
    const actual = query
      .expand('posts', q => q.expand('author', q => q.select('id')))
      .toString()
    const expected = '$expand=posts($expand=author($select=id))'
    expect(actual).toBe(expected)
  })

  it('expand and filter', () => {
    const query = odataQuery<User>()
    const actual = query
      .expand('posts', e => e.filter(q => q.content.startsWith('test')))
      .toString()
    const expected = "$expand=posts($filter=startswith(content, 'test'))"
    expect(actual).toBe(expected)
  })

  it('expand and filter composed', () => {
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

  it('expand and filter composed multiline', () => {
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

  it('expand and orderby', () => {
    const query = odataQuery<User>()
    const actual = query
      .expand('posts', e => e.orderBy(q => q.id.desc()))
      .toString()
    const expected = '$expand=posts($orderby=id desc)'
    expect(actual).toBe(expected)
  })

  it('expand and paginate', () => {
    const query = odataQuery<User>()
    const actual = query.expand('posts', e => e.paginate(0)).toString()
    const expected = '$expand=posts($top=0;$count=true)'
    expect(actual).toBe(expected)
  })

  it('expand and paginate object', () => {
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

  it('expand with empty query (no conditions)', () => {
    const query = odataQuery<User>()
    const actual = query.expand('posts').toString()
    const expected = '$expand=posts'
    expect(actual).toBe(expected)
  })

  it('expand with count false', () => {
    const query = odataQuery<User>()
    const actual = query
      .expand('posts', e => e.paginate({ pagesize: 5, page: 0, count: false }))
      .toString()
    const expected = '$expand=posts($top=5)'
    expect(actual).toBe(expected)
  })
})

describe('testing ODataQuery expand with key query', () => {
  it('expand', () => {
    const query = odataQuery<User>()
    const actual = query.expand(u => u.manager).toString()
    const expected = '$expand=manager'
    expect(actual).toBe(expected)
  })

  it('expand and select', () => {
    const query = odataQuery<User>()
    const actual = query
      .expand(
        u => u.manager,
        q => q.select('email')
      )
      .toString()
    const expected = '$expand=manager($select=email)'
    expect(actual).toBe(expected)
  })

  it('expand and select optional', () => {
    const query = odataQuery<User>()
    const actual = query
      .expand(
        u => u.manager,
        q => q.select('email')
      )
      .toString()
    const expected = '$expand=manager($select=email)'
    expect(actual).toBe(expected)
  })

  it('expand twice', () => {
    const query = odataQuery<User>()
    const actual = query
      .expand(
        u => u.manager.posts,
        q => q.select('id')
      )
      .toString()
    const expected = '$expand=manager/posts($select=id)'
    expect(actual).toBe(expected)
  })

  it('expand with empty query (no conditions)', () => {
    const query = odataQuery<User>()
    const actual = query.expand('posts', e => e).toString()
    const expected = '$expand=posts'
    expect(actual).toBe(expected)
  })
})
