import { odataQuery } from '../src'
import { Teacher } from './data/teacher'

describe('Query Composition Order Bug Tests', () => {
  it('should generate same URL regardless of expand/select order - case 1: expand then select', () => {
    const query = odataQuery<Teacher>()
      .expand('class', q => q.select('id', 'name'))
      .select('id', 'firstName', 'lastName')
      .toString()

    const expected =
      '$expand=class($select=id,name)&$select=id,firstName,lastName'
    expect(query).toBe(expected)
  })

  it('should generate same URL regardless of expand/select order - case 2: select then expand', () => {
    const query = odataQuery<Teacher>()
      .select('id', 'firstName', 'lastName')
      .expand('class', q => q.select('id', 'name'))
      .toString()

    const expected =
      '$expand=class($select=id,name)&$select=id,firstName,lastName'
    expect(query).toBe(expected)
  })

  it('should preserve multiple expands when using select', () => {
    const query = odataQuery<Teacher>()
      .expand('class', q => q.select('id', 'name'))
      .expand('department', q => q.select('id', 'title'))
      .select('id', 'firstName', 'lastName')
      .toString()

    const expected =
      '$expand=class($select=id,name),department($select=id,title)&$select=id,firstName,lastName'
    expect(query).toBe(expected)
  })

  it('should work with nested expands and select', () => {
    const query = odataQuery<Teacher>()
      .expand('class', q =>
        q
          .select('id', 'name')
          .expand('students', sq => sq.select('id', 'fullName'))
      )
      .select('id', 'firstName', 'lastName')
      .toString()

    const expected =
      '$expand=class($select=id,name;$expand=students($select=id,fullName))&$select=id,firstName,lastName'
    expect(query).toBe(expected)
  })

  it('should preserve expands when select is called multiple times', () => {
    const query = odataQuery<Teacher>()
      .expand('class')
      .select('id')
      .select('firstName', 'lastName') // This should replace the previous select, but keep the expand
      .toString()

    const expected = '$expand=class&$select=firstName,lastName'
    expect(query).toBe(expected)
  })

  it('should work with expand after multiple selects', () => {
    const query = odataQuery<Teacher>()
      .select('id')
      .select('firstName', 'lastName')
      .expand('class', q => q.select('id', 'name'))
      .toString()

    const expected = '$expand=class($select=id,name)&$select=firstName,lastName'
    expect(query).toBe(expected)
  })
})
