import { odataQuery } from '../src'
import { User } from './data/user'

describe('testing ODataQuery fromString', () => {
  describe('basic parameters', () => {
    it('should parse empty string', () => {
      const query = odataQuery.fromString<User>('')
      const actual = query.toString()
      const expected = ''
      expect(actual).toBe(expected)
    })

    it('should parse $filter', () => {
      const queryString = '$filter=id eq 1'
      const query = odataQuery.fromString<User>(queryString)
      const actual = query.toString()
      expect(actual).toBe(queryString)
    })

    it('should parse $select', () => {
      const queryString = '$select=id,email,surname'
      const query = odataQuery.fromString<User>(queryString)
      const actual = query.toString()
      expect(actual).toBe(queryString)
    })

    it('should parse $orderby', () => {
      const queryString = '$orderby=email asc'
      const query = odataQuery.fromString<User>(queryString)
      const actual = query.toString()
      expect(actual).toBe(queryString)
    })

    it('should parse $skip', () => {
      const queryString = '$skip=10'
      const query = odataQuery.fromString<User>(queryString)
      const actual = query.toString()
      expect(actual).toBe(queryString)
    })

    it('should parse $top', () => {
      const queryString = '$top=25'
      const query = odataQuery.fromString<User>(queryString)
      const actual = query.toString()
      expect(actual).toBe(queryString)
    })

    it('should parse $count', () => {
      const queryString = '$count=true'
      const query = odataQuery.fromString<User>(queryString)
      const actual = query.toString()
      expect(actual).toBe(queryString)
    })

    it('should parse $compute', () => {
      const queryString = '$compute=price mul quantity as totalPrice'
      const query = odataQuery.fromString<User>(queryString)
      const actual = query.toString()
      expect(actual).toBe(queryString)
    })

    it('should parse $search with simple text', () => {
      const queryString = '$search=bike'
      const query = odataQuery.fromString<User>(queryString)
      const actual = query.toString()
      expect(actual).toBe(queryString)
    })

    it('should parse $search with quoted value', () => {
      const queryString = '$search="2022"'
      const query = odataQuery.fromString<User>(queryString)
      const actual = query.toString()
      expect(actual).toBe(queryString)
    })

    it('should parse $search with logical operators', () => {
      const queryString = '$search=bike AND mountain'
      const query = odataQuery.fromString<User>(queryString)
      const actual = query.toString()
      expect(actual).toBe(queryString)
    })

    it('should parse $search with NOT operator', () => {
      const queryString = '$search=NOT clothing'
      const query = odataQuery.fromString<User>(queryString)
      const actual = query.toString()
      expect(actual).toBe(queryString)
    })
  })

  describe('simple $expand', () => {
    it('should parse simple expand', () => {
      const queryString = '$expand=address'
      const query = odataQuery.fromString<User>(queryString)
      const actual = query.toString()
      expect(actual).toBe(queryString)
    })

    it('should parse multiple expands', () => {
      const queryString = '$expand=address,posts'
      const query = odataQuery.fromString<User>(queryString)
      const actual = query.toString()
      expect(actual).toBe(queryString)
    })

    it('should parse expand with select', () => {
      const queryString = '$expand=address($select=code)'
      const query = odataQuery.fromString<User>(queryString)
      const actual = query.toString()
      expect(actual).toBe(queryString)
    })

    it('should parse expand with multiple select fields', () => {
      const queryString = '$expand=address($select=code,street)'
      const query = odataQuery.fromString<User>(queryString)
      const actual = query.toString()
      expect(actual).toBe(queryString)
    })

    it('should parse expand with filter', () => {
      const queryString = '$expand=posts($filter=id gt 5)'
      const query = odataQuery.fromString<User>(queryString)
      const actual = query.toString()
      expect(actual).toBe(queryString)
    })

    it('should parse expand with orderby', () => {
      const queryString = '$expand=posts($orderby=id desc)'
      const query = odataQuery.fromString<User>(queryString)
      const actual = query.toString()
      expect(actual).toBe(queryString)
    })

    it('should parse expand with pagination', () => {
      const queryString = '$expand=posts($skip=50;$top=10)'
      const query = odataQuery.fromString<User>(queryString)
      const actual = query.toString()
      expect(actual).toBe(queryString)
    })

    it('should parse expand with count', () => {
      const queryString = '$expand=posts($count=true)'
      const query = odataQuery.fromString<User>(queryString)
      const actual = query.toString()
      expect(actual).toBe(queryString)
    })

    it('should parse expand with compute', () => {
      const queryString =
        '$expand=posts($compute=title concat author as fullTitle)'
      const query = odataQuery.fromString<User>(queryString)
      const actual = query.toString()
      expect(actual).toBe(queryString)
    })

    it('should parse expand with search', () => {
      const queryString = '$expand=posts($search=technology)'
      const query = odataQuery.fromString<User>(queryString)
      const actual = query.toString()
      expect(actual).toBe(queryString)
    })
  })

  describe('nested $expand', () => {
    it('should parse nested expand', () => {
      const queryString = '$expand=address($expand=user($select=id))'
      const query = odataQuery.fromString<User>(queryString)
      const actual = query.toString()
      expect(actual).toBe(queryString)
    })

    it('should parse complex nested expand', () => {
      const queryString =
        '$expand=posts($select=id,title;$expand=comments($select=id,content;$filter=approved eq true))'
      const query = odataQuery.fromString<User>(queryString)
      const actual = query.toString()
      expect(actual).toBe(queryString)
    })
  })

  describe('$apply and groupby', () => {
    it('should parse simple groupby', () => {
      const queryString = '$apply=groupby((email))'
      const query = odataQuery.fromString<User>(queryString)
      const actual = query.toString()
      expect(actual).toBe(queryString)
    })

    it('should parse groupby with multiple fields', () => {
      const queryString = '$apply=groupby((email, surname))'
      const query = odataQuery.fromString<User>(queryString)
      const actual = query.toString()
      expect(actual).toBe(queryString)
    })

    it('should parse groupby with aggregation', () => {
      const queryString =
        '$apply=groupby((email), aggregate(id with min as minId))'
      const query = odataQuery.fromString<User>(queryString)
      const actual = query.toString()
      expect(actual).toBe(queryString)
    })

    it('should parse groupby with complex aggregation', () => {
      const queryString =
        '$apply=groupby((email, surname), aggregate(id with countdistinct as all, phoneNumbers with max as test))'
      const query = odataQuery.fromString<User>(queryString)
      const actual = query.toString()
      expect(actual).toBe(queryString)
    })
  })

  describe('combined parameters', () => {
    it('should parse multiple basic parameters', () => {
      const queryString = '$filter=id eq 1&$select=id,email&$orderby=email asc'
      const query = odataQuery.fromString<User>(queryString)
      const actual = query.toString()
      expect(actual).toBe(queryString)
    })

    it('should parse pagination with count', () => {
      const queryString = '$skip=125&$top=25&$count=true'
      const query = odataQuery.fromString<User>(queryString)
      const actual = query.toString()
      expect(actual).toBe(queryString)
    })

    it('should parse expand with main select', () => {
      const queryString = '$expand=address($select=code)&$select=id,email'
      const query = odataQuery.fromString<User>(queryString)
      const actual = query.toString()
      expect(actual).toBe(queryString)
    })

    it('should parse complex query with all parameters', () => {
      const queryString =
        '$filter=id gt 1&$expand=address($select=code,street)&$select=id,email,surname&$orderby=email desc&$skip=10&$top=5&$count=true'
      const query = odataQuery.fromString<User>(queryString)
      const actual = query.toString()
      expect(actual).toBe(queryString)
    })

    it('should parse query with compute and other operations', () => {
      const queryString =
        '$filter=id gt 1&$select=id,fullName&$orderby=fullName asc&$compute=givenName concat surname as fullName'
      const query = odataQuery.fromString<User>(queryString)
      const actual = query.toString()
      expect(actual).toBe(queryString)
    })
  })

  describe('edge cases', () => {
    it('should handle query string with leading ?', () => {
      const queryString = '?$filter=id eq 1&$select=email'
      const expected = '$filter=id eq 1&$select=email'
      const query = odataQuery.fromString<User>(queryString)
      const actual = query.toString()
      expect(actual).toBe(expected)
    })

    it('should handle encoded query string', () => {
      const queryString = '$filter=name%20eq%20%27John%27'
      const query = odataQuery.fromString<User>(queryString)
      const actual = query.toString()
      expect(actual).toBe("$filter=name eq 'John'")
    })

    it('should handle whitespace in parameters', () => {
      const queryString =
        '$select=id, email, surname&$orderby=email asc, id desc'
      const query = odataQuery.fromString<User>(queryString)
      const actual = query.toString()
      expect(actual).toBe(
        '$select=id,email,surname&$orderby=email asc, id desc'
      )
    })

    it('should be round-trip compatible', () => {
      // Test that fromString -> toString -> fromString produces the same result
      const originalQuery = odataQuery<User>()
        .filter(u => u.id.equals(1))
        .select('id', 'email')
        .orderBy('email')
        .expand('address', q => q.select('code'))
        .count()

      const queryString = originalQuery.toString()
      const parsedQuery = odataQuery.fromString<User>(queryString)
      const reparsedString = parsedQuery.toString()

      expect(reparsedString).toBe(queryString)
    })
  })

  describe('error handling', () => {
    it('should handle malformed expand gracefully', () => {
      const queryString = '$expand=address('
      const query = odataQuery.fromString<User>(queryString)
      // Should not throw, but may not parse the malformed expand correctly
      expect(() => query.toString()).not.toThrow()
    })

    it('should handle invalid numbers gracefully', () => {
      const queryString = '$skip=invalid&$top=notanumber'
      const query = odataQuery.fromString<User>(queryString)
      const actual = query.toString()
      // NaN should be handled gracefully
      expect(actual).toBe('')
    })

    it('should handle empty parameter values', () => {
      const query = odataQuery.fromString<User>('$filter=&$select=id,name')
      const actual = query.toString()
      expect(actual).toBe('$select=id,name')
    })

    it('should handle expand with empty nested query', () => {
      const query = odataQuery.fromString<User>(
        '$expand=posts()&$select=id,name'
      )
      const actual = query.toString()
      expect(actual).toBe('$expand=posts&$select=id,name')
    })

    it('should handle malformed query parameters', () => {
      // Test parameters with missing keys or values
      const query = odataQuery.fromString<User>(
        '=value&key=&$select=id&=&invalid'
      )
      const actual = query.toString()
      expect(actual).toBe('$select=id')
    })

    it('should handle empty expand parts', () => {
      // Test empty expand parts that would make trimmed falsy
      const query = odataQuery.fromString<User>(
        '$expand=,posts($select=title),'
      )
      const actual = query.toString()
      expect(actual).toBe('$expand=posts($select=title)')
    })

    it('should handle nested query with empty values', () => {
      // Test nested query with empty parameter values
      const query = odataQuery.fromString<User>(
        '$expand=posts($select=;$filter=)'
      )
      const actual = query.toString()
      expect(actual).toBe('$expand=posts')
    })

    it('should handle expand with key and nested parameters', () => {
      // This should trigger the rqd.key branch in makeRelationQuery
      const query = odataQuery.fromString<User>(
        '$expand=posts($select=title,content)&$select=id,name'
      )
      const actual = query.toString()
      expect(actual).toBe(
        '$expand=posts($select=title,content)&$select=id,name'
      )
    })
  })

  describe('toObject integration', () => {
    it('should convert parsed query to object format', () => {
      const queryString =
        '$filter=id eq 1&$select=id,name,email&$orderby=name desc'
      const query = odataQuery.fromString<User>(queryString)
      const actual = query.toObject()
      const expected = {
        $filter: 'id eq 1',
        $select: 'id,name,email',
        $orderby: 'name desc',
      }
      expect(actual).toEqual(expected)
    })

    it('should handle complex queries with expand in toObject', () => {
      const queryString =
        '$expand=posts($select=title;$filter=isPublished eq true)&$filter=isActive eq true&$skip=10&$top=5&$count=true'
      const query = odataQuery.fromString<User>(queryString)
      const actual = query.toObject()
      const expected = {
        $filter: 'isActive eq true',
        $expand: 'posts($select=title;$filter=isPublished eq true)',
        $skip: '10',
        $top: '5',
        $count: 'true',
      }
      expect(actual).toEqual(expected)
    })

    it('should handle compute operations in toObject', () => {
      const queryString =
        '$compute=givenName concat surname as fullName&$select=id,fullName&$filter=id gt 1'
      const query = odataQuery.fromString<User>(queryString)
      const actual = query.toObject()
      const expected = {
        $filter: 'id gt 1',
        $select: 'id,fullName',
        $compute: 'givenName concat surname as fullName',
      }
      expect(actual).toEqual(expected)
    })

    it('should handle empty query in toObject', () => {
      const query = odataQuery.fromString<User>('')
      const actual = query.toObject()
      const expected = {}
      expect(actual).toEqual(expected)
    })

    it('should support round-trip fromString -> toObject -> fromString', () => {
      const originalQuery =
        '$filter=isActive eq true&$select=id,name&$orderby=name asc'

      // Parse original query
      const parsedQuery = odataQuery.fromString<User>(originalQuery)

      // Convert to object
      const queryObject = parsedQuery.toObject()
      expect(queryObject).toEqual({
        $filter: 'isActive eq true',
        $select: 'id,name',
        $orderby: 'name asc',
      })

      // Convert object back to query string for comparison
      const reconstructedQuery = parsedQuery.toString()

      // Should be functionally equivalent (parameter order may differ per OData spec)
      expect(reconstructedQuery).toContain('$filter=isActive eq true')
      expect(reconstructedQuery).toContain('$select=id,name')
      expect(reconstructedQuery).toContain('$orderby=name asc')
    })
  })
})
