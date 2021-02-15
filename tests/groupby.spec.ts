import { User } from '../models'
import { odataQuery } from '../src'

describe('testing ODataQuery groupBy', () => {
  test('groupBy', () => {
    const query = odataQuery<User>()
    const actual = query.groupBy(['mail']).toString()
    const expected = '$apply=groupby((mail))'
    expect(actual).toBe(expected)
  })

  test('groupBy multiple', () => {
    const query = odataQuery<User>()
    const actual = query.groupBy(['mail', 'surname']).toString()
    const expected = '$apply=groupby((mail, surname))'
    expect(actual).toBe(expected)
  })

  test('groupBy aggregate', () => {
    const query = odataQuery<User>()
    const actual = query
      .groupBy(['mail', 'surname'], a => a.countdistinct('id', 'all'))
      .toString()
    const expected =
      '$apply=groupby((mail, surname), aggregate(id with countdistinct as all))'
    expect(actual).toBe(expected)
  })

  test('groupBy aggregate multiple', () => {
    const query = odataQuery<User>()

    const actual = query
      .groupBy(['mail', 'surname'], a =>
        a.countdistinct('id', 'all').max('phoneNumbers', 'test')
      )
      .toString()

    const expected =
      '$apply=groupby((mail, surname), aggregate(id with countdistinct as all, phoneNumbers with max as test))'
    expect(actual).toBe(expected)
  })
})
