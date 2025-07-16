import { odataQuery } from '../src'
import { User } from './data/models'

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

  it('groupBy with sum aggregation', () => {
    const query = odataQuery<User>()
    const actual = query
      .groupBy(['email'], a => a.sum('id', 'totalIds'))
      .toString()
    const expected =
      '$apply=groupby((email), aggregate(id with sum as totalIds))'
    expect(actual).toBe(expected)
  })

  it('groupBy with min aggregation', () => {
    const query = odataQuery<User>()
    const actual = query
      .groupBy(['email'], a => a.min('id', 'minId'))
      .toString()
    const expected = '$apply=groupby((email), aggregate(id with min as minId))'
    expect(actual).toBe(expected)
  })

  it('groupBy with max aggregation', () => {
    const query = odataQuery<User>()
    const actual = query
      .groupBy(['email'], a => a.max('id', 'maxId'))
      .toString()
    const expected = '$apply=groupby((email), aggregate(id with max as maxId))'
    expect(actual).toBe(expected)
  })

  it('groupBy with average aggregation', () => {
    const query = odataQuery<User>()
    const actual = query
      .groupBy(['email'], a => a.average('id', 'avgId'))
      .toString()
    const expected =
      '$apply=groupby((email), aggregate(id with average as avgId))'
    expect(actual).toBe(expected)
  })

  it('groupBy with custom aggregation', () => {
    const query = odataQuery<User>()
    const actual = query
      .groupBy(['email'], a => a.custom('id', 'custom', 'customId'))
      .toString()
    const expected =
      '$apply=groupby((email), aggregate(id with custom as customId))'
    expect(actual).toBe(expected)
  })
})
