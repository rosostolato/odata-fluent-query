/* eslint-disable @typescript-eslint/no-unused-vars */
import { Equal, Expect, NotEqual } from 'type-testing'
import { QueryResultType } from '../src/models/odata-query'
import { Library, LibraryBranch } from './data/library'
import { User, Post } from './data/user'

/**
 * Type Tests for QueryResultType
 *
 * This file uses the type-testing library to validate that QueryResultType
 * correctly infers the result types based on select, expand, and compute operations.
 * These tests ensure type safety at compile time.
 */

describe('QueryResultType Type Tests', () => {
  describe('Basic Type Inference - No Operations', () => {
    it('should include all required properties when no operations are applied', () => {
      // When no operations are applied, only required properties should be included
      type Result = QueryResultType<Library>

      // Should include required properties
      type test_has_id = Expect<Equal<Result['id'], string>>
      type test_has_name = Expect<Equal<Result['name'], string>>
      type test_has_type = Expect<Equal<Result['type'], 'public' | 'academic' | 'special'>>
      type test_has_established = Expect<Equal<Result['established'], Date>>
      type test_has_isOpen = Expect<Equal<Result['isOpen'], boolean>>
      type test_has_address = Expect<Equal<Result['address'], Library['address']>>
      type test_has_info = Expect<Equal<Result['info'], Library['info']>>

      // Should NOT include optional navigation properties without expand
      type test_no_books = Expect<Equal<Result['books'], never>>
      type test_no_members = Expect<Equal<Result['members'], never>>
      type test_no_librarians = Expect<Equal<Result['librarians'], never>>
      type test_no_events = Expect<Equal<Result['events'], never>>
    })

    it('should work with User entity', () => {
      type Result = QueryResultType<User>

      // Should include required properties
      type test_has_id = Expect<Equal<Result['id'], number>>
      type test_has_email = Expect<Equal<Result['email'], string>>
      type test_has_address = Expect<Equal<Result['address'], User['address']>>
      type test_has_phoneNumbers = Expect<Equal<Result['phoneNumbers'], string[]>>

      // Should NOT include optional navigation properties
      type test_no_posts = Expect<Equal<Result['posts'], never>>
      type test_no_manager = Expect<Equal<Result['manager'], never>>
    })
  })

  describe('Select Operations', () => {
    it('should only include selected properties when select is applied', () => {
      type Result = QueryResultType<Library, 'id' | 'name'>

      // Should include selected properties
      type test_has_id = Expect<Equal<Result['id'], string>>
      type test_has_name = Expect<Equal<Result['name'], string>>

      // Should NOT include other properties
      type test_no_type = Expect<Equal<Result['type'], never>>
      type test_no_established = Expect<Equal<Result['established'], never>>
      type test_no_address = Expect<Equal<Result['address'], never>>
      type test_no_books = Expect<Equal<Result['books'], never>>
    })

    it('should work with single property selection', () => {
      type Result = QueryResultType<Library, 'id'>

      type test_exact = Expect<Equal<Result, { id: string }>>
    })

    it('should work with complex type selection', () => {
      type Result = QueryResultType<Library, 'id' | 'address'>

      type test_has_id = Expect<Equal<Result['id'], string>>
      type test_has_address = Expect<Equal<Result['address'], Library['address']>>

      // Test the full result type
      type Expected = { id: string; address: Library['address'] }
      type test_result = Expect<Equal<Result, Expected>>
    })

    it('should work with User select operations', () => {
      type Result = QueryResultType<User, 'id' | 'email' | 'givenName'>

      type test_has_id = Expect<Equal<Result['id'], number>>
      type test_has_email = Expect<Equal<Result['email'], string>>
      type test_has_givenName = Expect<Equal<Result['givenName'], string>>
      type test_no_surname = Expect<Equal<Result['surname'], never>>
      type test_no_address = Expect<Equal<Result['address'], never>>
    })
  })

  describe('Expand Operations', () => {
    it('should include expanded navigation properties', () => {
      type Result = QueryResultType<Library, never, {}, 'books'>

      // Should include all required properties
      type test_has_id = Expect<Equal<Result['id'], string>>
      type test_has_name = Expect<Equal<Result['name'], string>>

      // Should include expanded navigation property (without undefined)
      type test_has_books = Expect<Equal<Result['books'], NonNullable<Library['books']>>>

      // Should NOT include other optional properties
      type test_no_members = Expect<Equal<Result['members'], never>>
      type test_no_librarians = Expect<Equal<Result['librarians'], never>>
    })

    it('should include multiple expanded properties', () => {
      type Result = QueryResultType<Library, never, {}, 'books' | 'members'>

      type test_has_books = Expect<Equal<Result['books'], NonNullable<Library['books']>>>
      type test_has_members = Expect<Equal<Result['members'], NonNullable<Library['members']>>>
      type test_no_librarians = Expect<Equal<Result['librarians'], never>>
    })

    it('should work with User navigation properties', () => {
      type Result = QueryResultType<User, never, {}, 'posts'>

      // posts is Post[] | null | undefined, after expand should be Post[] | null
      type test_has_posts = Expect<Equal<Result['posts'], Post[] | null>>
      type test_no_manager = Expect<Equal<Result['manager'], never>>
    })
  })

  describe('Compute Operations', () => {
    it('should add computed fields to the result type', () => {
      type Result = QueryResultType<Library, never, { displayName: string }>

      // Should include all required properties
      type test_has_id = Expect<Equal<Result['id'], string>>
      type test_has_name = Expect<Equal<Result['name'], string>>

      // Should include computed field
      type test_has_computed = Expect<Equal<Result['displayName'], string>>
    })

    it('should add multiple computed fields', () => {
      type Result = QueryResultType<
        Library,
        never,
        { displayName: string; fullAddress: string }
      >

      type test_has_displayName = Expect<Equal<Result['displayName'], string>>
      type test_has_fullAddress = Expect<Equal<Result['fullAddress'], string>>
    })

    it('should work with computed fields of different types', () => {
      type Result = QueryResultType<
        User,
        never,
        { fullName: string; ageInMonths: number; isAdult: boolean }
      >

      type test_has_fullName = Expect<Equal<Result['fullName'], string>>
      type test_has_ageInMonths = Expect<Equal<Result['ageInMonths'], number>>
      type test_has_isAdult = Expect<Equal<Result['isAdult'], boolean>>
    })
  })

  describe('Combined Operations', () => {
    it('should handle select + expand', () => {
      type Result = QueryResultType<Library, 'id' | 'name' | 'books', {}, 'books'>

      // Should only include selected properties
      type test_has_id = Expect<Equal<Result['id'], string>>
      type test_has_name = Expect<Equal<Result['name'], string>>
      type test_has_books = Expect<Equal<Result['books'], NonNullable<Library['books']>>>

      // Should NOT include non-selected properties
      type test_no_address = Expect<Equal<Result['address'], never>>
      type test_no_type = Expect<Equal<Result['type'], never>>
    })

    it('should handle select + compute', () => {
      type Result = QueryResultType<
        Library,
        'id' | 'displayName',
        { displayName: string }
      >

      type test_has_id = Expect<Equal<Result['id'], string>>
      type test_has_displayName = Expect<Equal<Result['displayName'], string>>
      type test_no_name = Expect<Equal<Result['name'], never>>
    })

    it('should handle expand + compute', () => {
      type Result = QueryResultType<
        Library,
        never,
        { bookCount: number },
        'books'
      >

      type test_has_id = Expect<Equal<Result['id'], string>>
      type test_has_books = Expect<Equal<Result['books'], NonNullable<Library['books']>>>
      type test_has_bookCount = Expect<Equal<Result['bookCount'], number>>
    })

    it('should handle select + expand + compute', () => {
      type Result = QueryResultType<
        Library,
        'id' | 'name' | 'books' | 'bookCount',
        { bookCount: number },
        'books'
      >

      // Should have selected properties
      type test_has_id = Expect<Equal<Result['id'], string>>
      type test_has_name = Expect<Equal<Result['name'], string>>

      // Should have expanded property
      type test_has_books = Expect<Equal<Result['books'], NonNullable<Library['books']>>>

      // Should have computed property
      type test_has_bookCount = Expect<Equal<Result['bookCount'], number>>

      // Should NOT have non-selected properties
      type test_no_address = Expect<Equal<Result['address'], never>>
      type test_no_type = Expect<Equal<Result['type'], never>>
    })

    it('should work with complex User scenarios', () => {
      type Result = QueryResultType<
        User,
        'id' | 'email' | 'fullName' | 'posts',
        { fullName: string },
        'posts'
      >

      type test_has_id = Expect<Equal<Result['id'], number>>
      type test_has_email = Expect<Equal<Result['email'], string>>
      type test_has_fullName = Expect<Equal<Result['fullName'], string>>
      type test_has_posts = Expect<Equal<Result['posts'], Post[] | null>>
      type test_no_address = Expect<Equal<Result['address'], never>>
      type test_no_givenName = Expect<Equal<Result['givenName'], never>>
    })
  })

  describe('Edge Cases', () => {
    it('should handle selecting a navigation property without expanding it', () => {
      // When you select a navigation property but don't expand it,
      // it shouldn't be included in the result type
      type Result = QueryResultType<Library, 'id' | 'books'>

      type test_has_id = Expect<Equal<Result['id'], string>>
      // books is not expanded, so it should not be in the result
      type test_books = Expect<Equal<Result['books'], never>>
    })

    it('should handle expanding a property and selecting it', () => {
      // When you both select and expand a property, it should be included
      type Result = QueryResultType<Library, 'id' | 'books', {}, 'books'>

      type test_has_id = Expect<Equal<Result['id'], string>>
      type test_has_books = Expect<Equal<Result['books'], NonNullable<Library['books']>>>
    })

    it('should handle empty type parameters correctly', () => {
      type NoSelect = QueryResultType<Library, never>
      type NoCompute = QueryResultType<Library, never, {}>
      type NoExpand = QueryResultType<Library, never, {}, never>

      // All should be equivalent and include all required properties
      type test_1 = Expect<Equal<NoSelect, NoCompute>>
      type test_2 = Expect<Equal<NoCompute, NoExpand>>
    })

    it('should work with LibraryBranch entity', () => {
      type Result = QueryResultType<
        LibraryBranch,
        'id' | 'name' | 'staff',
        {},
        'staff'
      >

      type test_has_id = Expect<Equal<Result['id'], string>>
      type test_has_name = Expect<Equal<Result['name'], string>>
      type test_has_staff = Expect<Equal<Result['staff'], NonNullable<LibraryBranch['staff']>>>
      type test_no_location = Expect<Equal<Result['location'], never>>
    })

    it('should preserve nullable types correctly', () => {
      // User has nullable properties like surname and age
      type Result = QueryResultType<User, 'id' | 'surname' | 'age'>

      type test_has_surname = Expect<Equal<Result['surname'], string | null>>
      type test_has_age = Expect<Equal<Result['age'], number | null>>
    })
  })

  describe('Type Safety and Constraints', () => {
    it('should not allow invalid type combinations', () => {
      // TSelected should be a valid key of T
      type ValidResult = QueryResultType<Library, 'id' | 'name'>
      type test_valid = Expect<Equal<ValidResult['id'], string>>

      // TExpanded should be a valid optional property key
      type ValidExpand = QueryResultType<Library, never, {}, 'books'>
      type test_valid_expand = Expect<Equal<ValidExpand['books'], NonNullable<Library['books']>>>
    })

    it('should distinguish between different entity types', () => {
      type LibraryResult = QueryResultType<Library, 'id'>
      type UserResult = QueryResultType<User, 'id'>

      // These should not be equal because id types differ
      type test_not_equal = Expect<NotEqual<LibraryResult, UserResult>>
    })

    it('should handle complex nested structures', () => {
      type Result = QueryResultType<Library, 'id' | 'address'>

      // Should properly preserve nested structure
      type AddressType = Result['address']
      type test_address_street = Expect<Equal<AddressType['street'], string>>
      type test_address_city = Expect<Equal<AddressType['city'], string>>
    })
  })

  describe('Real-World Scenarios', () => {
    it('should support API response typing pattern', () => {
      // Simulating a common API pattern
      type ListQuery = QueryResultType<Library, 'id' | 'name' | 'type'>
      type DetailQuery = QueryResultType<
        Library,
        'id' | 'name' | 'address' | 'books' | 'members',
        { totalItems: number },
        'books' | 'members'
      >

      type test_list = Expect<Equal<
        ListQuery,
        { id: string; name: string; type: 'public' | 'academic' | 'special' }
      >>

      type test_detail_has_computed = Expect<Equal<DetailQuery['totalItems'], number>>
      type test_detail_has_books = Expect<Equal<DetailQuery['books'], NonNullable<Library['books']>>>
    })

    it('should support dashboard query patterns', () => {
      type DashboardQuery = QueryResultType<
        User,
        'id' | 'email' | 'givenName' | 'displayName',
        { displayName: string }
      >

      type test_has_required = Expect<Equal<DashboardQuery['id'], number>>
      type test_has_computed = Expect<Equal<DashboardQuery['displayName'], string>>
      type test_no_address = Expect<Equal<DashboardQuery['address'], never>>
    })

    it('should support nested relationship queries', () => {
      type NestedQuery = QueryResultType<
        LibraryBranch,
        'id' | 'name' | 'mainLibrary' | 'staff',
        {},
        'mainLibrary' | 'staff'
      >

      type test_has_main = Expect<Equal<NestedQuery['mainLibrary'], NonNullable<LibraryBranch['mainLibrary']>>>
      type test_has_staff = Expect<Equal<NestedQuery['staff'], NonNullable<LibraryBranch['staff']>>>
    })
  })
})
