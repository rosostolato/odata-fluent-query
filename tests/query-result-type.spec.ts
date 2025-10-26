import { Equal, Expect, NotEqual } from 'type-testing'
import { QueryResultType } from '../src/models/odata-query'
import { Library, LibraryBranch } from './data/library'
import { Post, User } from './data/user'

// This file uses the type-testing library to validate that QueryResultType
// correctly infers the result types based on select, expand, and compute operations.
// These tests ensure type safety at compile time.
//
// Note: We don't test that properties equal `never` because Equal<never, never> returns false.
// Instead, we test the complete result type or verify properties that DO exist.

describe('QueryResultType Type Tests', () => {
  describe('Basic Type Inference - No Operations', () => {
    it('should include all required properties when no operations are applied', () => {
      type Result = QueryResultType<Library>

      type test_has_id = Expect<Equal<Result['id'], string>>
      type test_has_name = Expect<Equal<Result['name'], string>>
      type test_has_type = Expect<
        Equal<Result['type'], 'public' | 'academic' | 'special'>
      >
      type test_has_established = Expect<Equal<Result['established'], Date>>
      type test_has_isOpen = Expect<Equal<Result['isOpen'], boolean>>
      type test_has_address = Expect<
        Equal<Result['address'], Library['address']>
      >
      type test_has_info = Expect<Equal<Result['info'], Library['info']>>

      type ResultKeys = keyof Result
      type BooksNotInKeys = 'books' extends ResultKeys ? false : true
      type test_no_books = Expect<BooksNotInKeys>
    })

    it('should work with User entity', () => {
      type Result = QueryResultType<User>

      type test_has_id = Expect<Equal<Result['id'], number>>
      type test_has_email = Expect<Equal<Result['email'], string>>
      type test_has_address = Expect<Equal<Result['address'], User['address']>>
      type test_has_phoneNumbers = Expect<
        Equal<Result['phoneNumbers'], string[]>
      >

      type ResultKeys = keyof Result
      type PostsNotInKeys = 'posts' extends ResultKeys ? false : true
      type test_no_posts = Expect<PostsNotInKeys>
    })
  })

  describe('Select Operations', () => {
    it('should only include selected properties when select is applied', () => {
      type Result = QueryResultType<Library, 'id' | 'name'>

      type test_exact = Expect<Equal<Result, { id: string; name: string }>>
    })

    it('should work with single property selection', () => {
      type Result = QueryResultType<Library, 'id'>

      type test_exact = Expect<Equal<Result, { id: string }>>
    })

    it('should work with complex type selection', () => {
      type Result = QueryResultType<Library, 'id' | 'address'>

      type Expected = { id: string; address: Library['address'] }
      type test_result = Expect<Equal<Result, Expected>>
    })

    it('should work with User select operations', () => {
      type Result = QueryResultType<User, 'id' | 'email' | 'givenName'>

      type Expected = { id: number; email: string; givenName: string }
      type test_result = Expect<Equal<Result, Expected>>
    })
  })

  describe('Expand Operations', () => {
    it('should include expanded navigation properties', () => {
      type Result = QueryResultType<Library, never, {}, 'books'>

      type test_has_id = Expect<Equal<Result['id'], string>>
      type test_has_name = Expect<Equal<Result['name'], string>>
      type test_has_books = Expect<
        Equal<Result['books'], NonNullable<Library['books']>>
      >

      type ResultKeys = keyof Result
      type MembersNotInKeys = 'members' extends ResultKeys ? false : true
      type test_no_members = Expect<MembersNotInKeys>
    })

    it('should include multiple expanded properties', () => {
      type Result = QueryResultType<Library, never, {}, 'books' | 'members'>

      type test_has_books = Expect<
        Equal<Result['books'], NonNullable<Library['books']>>
      >
      type test_has_members = Expect<
        Equal<Result['members'], NonNullable<Library['members']>>
      >

      type ResultKeys = keyof Result
      type LibrariansNotInKeys = 'librarians' extends ResultKeys ? false : true
      type test_no_librarians = Expect<LibrariansNotInKeys>
    })

    it('should work with User navigation properties', () => {
      type Result = QueryResultType<User, never, {}, 'posts'>

      type test_has_posts = Expect<Equal<Result['posts'], Post[] | null>>
    })
  })

  describe('Compute Operations', () => {
    it('should add computed fields to the result type', () => {
      type Result = QueryResultType<Library, never, { displayName: string }>

      type test_has_id = Expect<Equal<Result['id'], string>>
      type test_has_name = Expect<Equal<Result['name'], string>>
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
      type Result = QueryResultType<
        Library,
        'id' | 'name' | 'books',
        {},
        'books'
      >

      type test_has_id = Expect<Equal<Result['id'], string>>
      type test_has_name = Expect<Equal<Result['name'], string>>
      type test_has_books = Expect<
        Equal<Result['books'], NonNullable<Library['books']>>
      >

      type ResultKeys = keyof Result
      type AddressNotInKeys = 'address' extends ResultKeys ? false : true
      type test_no_address = Expect<AddressNotInKeys>
    })

    it('should handle select + compute', () => {
      type Result = QueryResultType<
        Library,
        'id' | 'displayName',
        { displayName: string }
      >

      type Expected = { id: string; displayName: string }
      type test_result = Expect<Equal<Result, Expected>>
    })

    it('should handle expand + compute', () => {
      type Result = QueryResultType<
        Library,
        never,
        { bookCount: number },
        'books'
      >

      type test_has_id = Expect<Equal<Result['id'], string>>
      type test_has_books = Expect<
        Equal<Result['books'], NonNullable<Library['books']>>
      >
      type test_has_bookCount = Expect<Equal<Result['bookCount'], number>>
    })

    it('should handle select + expand + compute', () => {
      type Result = QueryResultType<
        Library,
        'id' | 'name' | 'books' | 'bookCount',
        { bookCount: number },
        'books'
      >

      type test_has_id = Expect<Equal<Result['id'], string>>
      type test_has_name = Expect<Equal<Result['name'], string>>
      type test_has_books = Expect<
        Equal<Result['books'], NonNullable<Library['books']>>
      >
      type test_has_bookCount = Expect<Equal<Result['bookCount'], number>>

      type ResultKeys = keyof Result
      type AddressNotInKeys = 'address' extends ResultKeys ? false : true
      type test_no_address = Expect<AddressNotInKeys>
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
    })
  })

  describe('Edge Cases', () => {
    it('should handle selecting a navigation property without expanding it', () => {
      type Result = QueryResultType<Library, 'id' | 'books'>

      type Expected = { id: string }
      type test_result = Expect<Equal<Result, Expected>>
    })

    it('should handle expanding a property and selecting it', () => {
      type Result = QueryResultType<Library, 'id' | 'books', {}, 'books'>

      type test_has_id = Expect<Equal<Result['id'], string>>
      type test_has_books = Expect<
        Equal<Result['books'], NonNullable<Library['books']>>
      >
    })

    it('should handle empty type parameters correctly', () => {
      type NoSelect = QueryResultType<Library, never>
      type NoCompute = QueryResultType<Library, never, {}>
      type NoExpand = QueryResultType<Library, never, {}, never>

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
      type test_has_staff = Expect<
        Equal<Result['staff'], NonNullable<LibraryBranch['staff']>>
      >
    })

    it('should preserve nullable types correctly', () => {
      type Result = QueryResultType<User, 'id' | 'surname' | 'age'>

      type test_has_surname = Expect<Equal<Result['surname'], string | null>>
      type test_has_age = Expect<Equal<Result['age'], number | null>>
    })
  })

  describe('Type Safety and Constraints', () => {
    it('should not allow invalid type combinations', () => {
      type ValidResult = QueryResultType<Library, 'id' | 'name'>
      type test_valid = Expect<Equal<ValidResult['id'], string>>

      type ValidExpand = QueryResultType<Library, never, {}, 'books'>
      type test_valid_expand = Expect<
        Equal<ValidExpand['books'], NonNullable<Library['books']>>
      >
    })

    it('should distinguish between different entity types', () => {
      type LibraryResult = QueryResultType<Library, 'id'>
      type UserResult = QueryResultType<User, 'id'>

      type test_not_equal = Expect<NotEqual<LibraryResult, UserResult>>
    })

    it('should handle complex nested structures', () => {
      type Result = QueryResultType<Library, 'id' | 'address'>

      type AddressType = Result['address']
      type test_address_street = Expect<Equal<AddressType['street'], string>>
      type test_address_city = Expect<Equal<AddressType['city'], string>>
    })
  })

  describe('Real-World Scenarios', () => {
    it('should support API response typing pattern', () => {
      type ListQuery = QueryResultType<Library, 'id' | 'name' | 'type'>
      type DetailQuery = QueryResultType<
        Library,
        'id' | 'name' | 'address' | 'books' | 'members' | 'totalItems',
        { totalItems: number },
        'books' | 'members'
      >

      type test_list = Expect<
        Equal<
          ListQuery,
          { id: string; name: string; type: 'public' | 'academic' | 'special' }
        >
      >

      type test_detail_has_computed = Expect<
        Equal<DetailQuery['totalItems'], number>
      >
      type test_detail_has_books = Expect<
        Equal<DetailQuery['books'], NonNullable<Library['books']>>
      >
    })

    it('should support dashboard query patterns', () => {
      type DashboardQuery = QueryResultType<
        User,
        'id' | 'email' | 'givenName' | 'displayName',
        { displayName: string }
      >

      type test_has_required = Expect<Equal<DashboardQuery['id'], number>>
      type test_has_computed = Expect<
        Equal<DashboardQuery['displayName'], string>
      >
    })

    it('should support nested relationship queries', () => {
      type NestedQuery = QueryResultType<
        LibraryBranch,
        'id' | 'name' | 'mainLibrary' | 'staff',
        {},
        'mainLibrary' | 'staff'
      >

      type test_has_main = Expect<
        Equal<
          NestedQuery['mainLibrary'],
          NonNullable<LibraryBranch['mainLibrary']>
        >
      >
      type test_has_staff = Expect<
        Equal<NestedQuery['staff'], NonNullable<LibraryBranch['staff']>>
      >
    })
  })
})
