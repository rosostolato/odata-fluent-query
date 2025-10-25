import { odataQuery } from '../src'
import { User } from './data/user'

describe('test odataQuery search functionality', () => {
  describe('basic search operations', () => {
    it('search with single word (no quotes)', () => {
      const query = odataQuery<User>()
      const actual = query.search(s => s.token('bike')).toString()
      const expected = '$search=bike'

      expect(actual).toBe(expected)
    })

    it('search with multi-word phrase (no quotes)', () => {
      const query = odataQuery<User>()
      const actual = query.search(s => s.token('mountain bike')).toString()
      const expected = '$search=mountain bike'

      expect(actual).toBe(expected)
    })

    it('search with number (quoted)', () => {
      const query = odataQuery<User>()
      const actual = query.search(s => s.token(2022)).toString()
      const expected = '$search="2022"'

      expect(actual).toBe(expected)
    })

    it('search with boolean (quoted)', () => {
      const query = odataQuery<User>()
      const actual = query.search(s => s.token(true)).toString()
      const expected = '$search="true"'

      expect(actual).toBe(expected)
    })

    it('search with date string (quoted)', () => {
      const query = odataQuery<User>()
      const actual = query.search(s => s.token('2023-01-01')).toString()
      const expected = '$search="2023-01-01"'

      expect(actual).toBe(expected)
    })

    it('search with special characters (quoted)', () => {
      const query = odataQuery<User>()
      const actual = query.search(s => s.token('example.com')).toString()
      const expected = '$search="example.com"'

      expect(actual).toBe(expected)
    })

    it('search with Technology (no quotes)', () => {
      const query = odataQuery<User>()
      const actual = query.search(s => s.token('Technology')).toString()
      const expected = '$search=Technology'

      expect(actual).toBe(expected)
    })
  })

  describe('search with logical operators', () => {
    it('search with AND operator', () => {
      const query = odataQuery<User>()
      const actual = query.search(s => s.token('bike').and('mountain')).toString()
      const expected = '$search=bike AND mountain'

      expect(actual).toBe(expected)
    })

    it('search with OR operator', () => {
      const query = odataQuery<User>()
      const actual = query.search(s => s.token('bike').or('car')).toString()
      const expected = '$search=bike OR car'

      expect(actual).toBe(expected)
    })

    it('search with chained AND operations', () => {
      const query = odataQuery<User>()
      const actual = query.search(s => s.token('mountain').and('bike').and('red')).toString()
      const expected = '$search=mountain AND bike AND red'

      expect(actual).toBe(expected)
    })

    it('search with chained OR operations', () => {
      const query = odataQuery<User>()
      const actual = query.search(s => s.token('bike').or('car').or('truck')).toString()
      const expected = '$search=bike OR car OR truck'

      expect(actual).toBe(expected)
    })

    it('search mixing simple text and quoted values with logical operators', () => {
      const query = odataQuery<User>()
      const actual = query.search(s => s.token('bike').and('2022')).toString()
      const expected = '$search=bike AND "2022"'

      expect(actual).toBe(expected)
    })

    it('search with AND using number parameter', () => {
      const query = odataQuery<User>()
      const actual = query.search(s => s.token('bike').and(2023)).toString()
      const expected = '$search=bike AND "2023"'

      expect(actual).toBe(expected)
    })

    it('search with OR using boolean parameter', () => {
      const query = odataQuery<User>()
      const actual = query.search(s => s.token('bike').or(true)).toString()
      const expected = '$search=bike OR "true"'

      expect(actual).toBe(expected)
    })
  })

  describe('search with NOT operator', () => {
    it('search with NOT on simple text', () => {
      const query = odataQuery<User>()
      const actual = query.search(s => s.token('clothing').not()).toString()
      const expected = '$search=NOT clothing'

      expect(actual).toBe(expected)
    })

    it('search with NOT on number', () => {
      const query = odataQuery<User>()
      const actual = query.search(s => s.token(2022).not()).toString()
      const expected = '$search=NOT "2022"'

      expect(actual).toBe(expected)
    })

    it('search with NOT and AND', () => {
      const query = odataQuery<User>()
      const actual = query.search(s => s.token('bike').and('red').not()).toString()
      const expected = '$search=NOT bike AND red'

      expect(actual).toBe(expected)
    })

    it('search with NOT and OR', () => {
      const query = odataQuery<User>()
      const actual = query.search(s => s.token('clothing').not().or('shoes')).toString()
      const expected = '$search=NOT clothing OR shoes'
      
      expect(actual).toBe(expected)
    })
  })

  describe('search combined with other query options', () => {
    it('search combined with filter', () => {
      const query = odataQuery<User>()
      const actual = query
        .search(s => s.token('bike'))
        .filter(u => u.id.biggerThan(10))
        .toString()

      expect(actual).toContain('$search=bike')
      expect(actual).toContain('$filter=id gt 10')
    })

    it('search combined with select', () => {
      const query = odataQuery<User>()
      const actual = query
        .search(s => s.token('mountain bike'))
        .select('id', 'email')
        .toString()

      expect(actual).toContain('$search=mountain bike')
      expect(actual).toContain('$select=id,email')
    })

    it('search combined with orderBy', () => {
      const query = odataQuery<User>()
      const actual = query
        .search(s => s.token('bike'))
        .orderBy('email', 'desc')
        .toString()

      expect(actual).toContain('$search=bike')
      expect(actual).toContain('$orderby=email desc')
    })

    it('search combined with pagination', () => {
      const query = odataQuery<User>()
      const actual = query
        .search(s => s.token('bike'))
        .paginate(10, 1)
        .toString()

      expect(actual).toContain('$search=bike')
      expect(actual).toContain('$top=10')
      expect(actual).toContain('$skip=10')
      expect(actual).toContain('$count=true')
    })

    it('search combined with number and filter', () => {
      const query = odataQuery<User>()
      const actual = query
        .search(s => s.token(2022))
        .filter(u => u.id.biggerThan(10))
        .toString()

      expect(actual).toContain('$search="2022"')
      expect(actual).toContain('$filter=id gt 10')
    })
  })

  describe('search toObject method', () => {
    it('search converts to object correctly', () => {
      const query = odataQuery<User>()
      const actual = query.search(s => s.token('bike').and('mountain')).toObject()

      expect(actual).toEqual({
        $search: 'bike AND mountain'
      })
    })

    it('search with number converts to object correctly', () => {
      const query = odataQuery<User>()
      const actual = query.search(s => s.token(2022)).toObject()

      expect(actual).toEqual({
        $search: '"2022"'
      })
    })

    it('search with other options converts to object correctly', () => {
      const query = odataQuery<User>()
      const actual = query
        .search(s => s.token('bike'))
        .filter(u => u.id.biggerThan(10))
        .select('id', 'email')
        .toObject()
      
      expect(actual).toEqual({
        $search: 'bike',
        $filter: 'id gt 10',
        $select: 'id,email'
      })
    })
  })

  describe('complex search expressions', () => {
    it('handles OData operator precedence', () => {
      const query = odataQuery<User>()
      const actual = query.search(s => s.token('bike').or('car').and('red')).toString()
      const expected = '$search=bike OR car AND red'

      expect(actual).toBe(expected)
    })

    it('handles mixed logical operators', () => {
      const query = odataQuery<User>()
      const actual = query.search(s => 
        s.token('mountain').and('bike').or('road').and('bicycle')
      ).toString()
      const expected = '$search=mountain AND bike OR road AND bicycle'

      expect(actual).toBe(expected)
    })

    it('handles NOT with multiple terms', () => {
      const query = odataQuery<User>()
      const actual = query.search(s => 
        s.token('bike').and('mountain').not().or('car')
      ).toString()
      const expected = '$search=NOT bike AND mountain OR car'

      expect(actual).toBe(expected)
    })

    it('handles mixed simple text and quoted values in complex expressions', () => {
      const query = odataQuery<User>()
      const actual = query.search(s => 
        s.token('bike').and('mountain').or('2022')
      ).toString()
      const expected = '$search=bike AND mountain OR "2022"'
      
      expect(actual).toBe(expected)
    })
  })

  describe('search in expand operations', () => {
    it('should work within expand queries', () => {
      const query = odataQuery<User>()
      const actual = query
        .expand('posts', q => q
          .search(s => s.token('technology'))
          .select('id', 'content')
        )
        .toString()
      
      expect(actual).toContain('$expand=posts')
      expect(actual).toContain('$search=technology')
      expect(actual).toContain('$select=id,content')
      expect(actual).toBe('$expand=posts($select=id,content;$search=technology)')
    })

    it('should combine search with other query options in expand', () => {
      const query = odataQuery<User>()
      const actual = query
        .expand('posts', q => q
          .search(s => s.token(2023))
          .filter(p => p.id.biggerThan(1))
          .orderBy('date')
        )
        .toString()
      
      expect(actual).toContain('$search="2023"')
      expect(actual).toContain('$filter=id gt 1')
      expect(actual).toContain('$orderby=date')
    })
  })
})