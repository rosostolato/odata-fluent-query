import { odataQuery } from '../src'
import { User } from './data/user'

describe('test odataQuery search functionality', () => {
  describe('basic search operations', () => {
    it('search with single phrase', () => {
      const query = odataQuery<User>()
      const actual = query.search(s => s.phrase('bike')).toString()
      const expected = '$search="bike"'
      expect(actual).toBe(expected)
    })

    it('search with multi-word phrase', () => {
      const query = odataQuery<User>()
      const actual = query.search(s => s.phrase('mountain bike')).toString()
      const expected = '$search="mountain bike"'
      expect(actual).toBe(expected)
    })
  })

  describe('search with logical operators', () => {
    it('search with AND operator', () => {
      const query = odataQuery<User>()
      const actual = query.search(s => s.phrase('bike').and('mountain')).toString()
      const expected = '$search="bike" AND "mountain"'
      expect(actual).toBe(expected)
    })

    it('search with OR operator', () => {
      const query = odataQuery<User>()
      const actual = query.search(s => s.phrase('bike').or('car')).toString()
      const expected = '$search="bike" OR "car"'
      expect(actual).toBe(expected)
    })

    it('search with chained AND operations', () => {
      const query = odataQuery<User>()
      const actual = query.search(s => s.phrase('mountain').and('bike').and('red')).toString()
      const expected = '$search="mountain" AND "bike" AND "red"'
      expect(actual).toBe(expected)
    })

    it('search with chained OR operations', () => {
      const query = odataQuery<User>()
      const actual = query.search(s => s.phrase('bike').or('car').or('truck')).toString()
      const expected = '$search="bike" OR "car" OR "truck"'
      expect(actual).toBe(expected)
    })
  })

  describe('search with NOT operator', () => {
    it('search with NOT on single phrase', () => {
      const query = odataQuery<User>()
      const actual = query.search(s => s.phrase('clothing').not()).toString()
      const expected = '$search=NOT "clothing"'
      expect(actual).toBe(expected)
    })

    it('search with NOT and AND', () => {
      const query = odataQuery<User>()
      const actual = query.search(s => s.phrase('bike').and('red').not()).toString()
      const expected = '$search=NOT "bike" AND "red"'
      expect(actual).toBe(expected)
    })

    it('search with NOT and OR', () => {
      const query = odataQuery<User>()
      const actual = query.search(s => s.phrase('clothing').not().or('shoes')).toString()
      const expected = '$search=NOT "clothing" OR "shoes"'
      expect(actual).toBe(expected)
    })
  })

  describe('search combined with other query options', () => {
    it('search combined with filter', () => {
      const query = odataQuery<User>()
      const actual = query
        .search(s => s.phrase('bike'))
        .filter(u => u.id.biggerThan(10))
        .toString()
      expect(actual).toContain('$search="bike"')
      expect(actual).toContain('$filter=id gt 10')
    })

    it('search combined with select', () => {
      const query = odataQuery<User>()
      const actual = query
        .search(s => s.phrase('mountain bike'))
        .select('id', 'email')
        .toString()
      expect(actual).toContain('$search="mountain bike"')
      expect(actual).toContain('$select=id,email')
    })

    it('search combined with orderBy', () => {
      const query = odataQuery<User>()
      const actual = query
        .search(s => s.phrase('bike'))
        .orderBy('email', 'desc')
        .toString()
      expect(actual).toContain('$search="bike"')
      expect(actual).toContain('$orderby=email desc')
    })

    it('search combined with pagination', () => {
      const query = odataQuery<User>()
      const actual = query
        .search(s => s.phrase('bike'))
        .paginate(10, 1)
        .toString()
      expect(actual).toContain('$search="bike"')
      expect(actual).toContain('$top=10')
      expect(actual).toContain('$skip=10')
      expect(actual).toContain('$count=true')
    })
  })

  describe('search toObject method', () => {
    it('search converts to object correctly', () => {
      const query = odataQuery<User>()
      const actual = query.search(s => s.phrase('bike').and('mountain')).toObject()
      expect(actual).toEqual({
        $search: '"bike" AND "mountain"'
      })
    })

    it('search with other options converts to object correctly', () => {
      const query = odataQuery<User>()
      const actual = query
        .search(s => s.phrase('bike'))
        .filter(u => u.id.biggerThan(10))
        .select('id', 'email')
        .toObject()
      
      expect(actual).toEqual({
        $search: '"bike"',
        $filter: 'id gt 10',
        $select: 'id,email'
      })
    })
  })

  describe('complex search expressions', () => {
    it('handles OData operator precedence correctly', () => {
      // Testing: bike OR car AND red (should be: bike OR (car AND red) due to precedence)
      const query = odataQuery<User>()
      const actual = query.search(s => s.phrase('bike').or('car').and('red')).toString()
      const expected = '$search="bike" OR "car" AND "red"'
      expect(actual).toBe(expected)
    })

    it('handles mixed logical operators', () => {
      const query = odataQuery<User>()
      const actual = query.search(s => 
        s.phrase('mountain').and('bike').or('road').and('bicycle')
      ).toString()
      const expected = '$search="mountain" AND "bike" OR "road" AND "bicycle"'
      expect(actual).toBe(expected)
    })

    it('handles NOT with multiple terms', () => {
      const query = odataQuery<User>()
      const actual = query.search(s => 
        s.phrase('bike').and('mountain').not().or('car')
      ).toString()
      const expected = '$search=NOT "bike" AND "mountain" OR "car"'
      expect(actual).toBe(expected)
    })
  })
})