import { User } from './data/models'
import { odataQuery } from '../src'

describe('testing ODataQuery groupBy', () => {
  it('groupBy', () => {
    const query = odataQuery<User>()
    const actual = query.groupBy(['email']).toString()
    const expected = '$apply=groupby((email))'
    expect(actual).toBe(expected)
  })

  it('groupBy multiple', () => {
    const query = odataQuery<User>()
    const actual = query.groupBy(['email', 'surname']).toString()
    const expected = '$apply=groupby((email, surname))'
    expect(actual).toBe(expected)
  })

  it('groupBy aggregate', () => {
    const query = odataQuery<User>()
    const actual = query
      .groupBy(['email', 'surname'], a => a.countdistinct('id', 'all'))
      .toString()
    const expected =
      '$apply=groupby((email, surname), aggregate(id with countdistinct as all))'
    expect(actual).toBe(expected)
  })

  it('groupBy aggregate multiple', () => {
    const query = odataQuery<User>()

    const actual = query
      .groupBy(['email', 'surname'], a =>
        a.countdistinct('id', 'all').max('phoneNumbers', 'test')
      )
      .toString()

    const expected =
      '$apply=groupby((email, surname), aggregate(id with countdistinct as all, phoneNumbers with max as test))'
    expect(actual).toBe(expected)
  })
})
