import { odataQuery } from '../src'
import { User } from './data/user'

describe('testing odataQuery select', () => {
  it('select one', () => {
    const query = odataQuery<User>()
    const actual = query.select('id').toString()
    const expected = '$select=id'
    expect(actual).toBe(expected)
  })

  it('select multiple', () => {
    const query = odataQuery<User>()
    const actual = query.select('id', 'email', 'surname').toString()
    const expected = '$select=id,email,surname'
    expect(actual).toBe(expected)
  })

  it('select with expression', () => {
    const query = odataQuery<User>()
    const actual = query
      .select(
        x => x.id,
        x => x.address.street,
      )
      .toString()
    const expected = '$select=id,address/street'
    expect(actual).toBe(expected)
  })

  it('select mixed', () => {
    const query = odataQuery<User>()
    const actual = query
      .select('id', x => x.givenName, 'accountEnabled')
      .toString()
    const expected = '$select=id,givenName,accountEnabled'
    expect(actual).toBe(expected)
  })

  it('select optional', () => {
    const query = odataQuery<User>()
    const actual = query
      .select(
        x => x.givenName,
        x => x.surname,
      )
      .toString()
    const expected = '$select=givenName,surname'
    expect(actual).toBe(expected)
  })

  it('preserve expand after select', () => {
    const query = odataQuery<User>()
    const expandedQuery = query.expand('address')
    let actual = expandedQuery.toString()
    let expected = '$expand=address'
    expect(actual).toBe(expected)
    actual = expandedQuery.select('email').toString()
    expected = '$expand=address&$select=email'
    expect(actual).toBe(expected)
  })

  it('preserve multiple expands after select', () => {
    const query = odataQuery<User>()
    const actual = query
      .expand('address')
      .expand('posts', p => p.select('id'))
      .select('email', 'givenName')
      .toString()
    const expected = '$expand=address,posts($select=id)&$select=email,givenName'
    expect(actual).toBe(expected)
  })

  it('preserve expand with nested query after select', () => {
    const query = odataQuery<User>()
    const actual = query
      .expand('posts', p =>
        p.select('id', 'content').filter(post => post.id.biggerThan(5)),
      )
      .select('email', 'givenName')
      .toString()
    const expected =
      '$expand=posts($select=id,content;$filter=id gt 5)&$select=email,givenName'
    expect(actual).toBe(expected)
  })

  it('select should not remove unrelated expands', () => {
    const query = odataQuery<User>()
    const actual = query
      .expand('address')
      .expand('posts')
      .select('email')
      .toString()
    const expected = '$expand=address,posts&$select=email'
    expect(actual).toBe(expected)
  })
})
