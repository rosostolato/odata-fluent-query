import { Equal, Expect } from 'type-testing'
import {
  RequiredProperties,
  OptionalProperties,
  ExpandedOptionalProperties,
  SelectedProperties,
  IntersectTypes,
  Prettify,
} from '../src/models/type-utils'
import { Library, LibraryBranch } from './data/library'
import { User } from './data/user'

// These tests validate the foundational type utilities that QueryResultType depends on.
// They ensure correct behavior with exactOptionalPropertyTypes: true.

describe('Type Utility Tests', () => {
  describe('RequiredProperties', () => {
    it('should extract only required properties from Library', () => {
      type Required = RequiredProperties<Library>

      type test_has_id = Expect<Equal<Required['id'], string>>
      type test_has_name = Expect<Equal<Required['name'], string>>
      type test_has_type = Expect<Equal<Required['type'], 'public' | 'academic' | 'special'>>
      type test_has_established = Expect<Equal<Required['established'], Date>>
      type test_has_address = Expect<Equal<Required['address'], Library['address']>>
      type test_has_info = Expect<Equal<Required['info'], Library['info']>>

      type RequiredKeys = keyof Required
      type HasBooks = 'books' extends RequiredKeys ? false : true
      type test_no_books = Expect<HasBooks>

      type HasMembers = 'members' extends RequiredKeys ? false : true
      type test_no_members = Expect<HasMembers>
    })

    it('should extract only required properties from User', () => {
      type Required = RequiredProperties<User>

      type test_has_id = Expect<Equal<Required['id'], number>>
      type test_has_email = Expect<Equal<Required['email'], string>>
      type test_has_surname = Expect<Equal<Required['surname'], string | null>>
      type test_has_address = Expect<Equal<Required['address'], User['address']>>
      type test_has_phoneNumbers = Expect<Equal<Required['phoneNumbers'], string[]>>

      type RequiredKeys = keyof Required
      type HasPosts = 'posts' extends RequiredKeys ? false : true
      type test_no_posts = Expect<HasPosts>

      type HasManager = 'manager' extends RequiredKeys ? false : true
      type test_no_manager = Expect<HasManager>
    })

    it('should work with LibraryBranch', () => {
      type Required = RequiredProperties<LibraryBranch>

      type test_has_id = Expect<Equal<Required['id'], string>>
      type test_has_name = Expect<Equal<Required['name'], string>>
      type test_has_location = Expect<Equal<Required['location'], LibraryBranch['location']>>

      type RequiredKeys = keyof Required
      type HasStaff = 'staff' extends RequiredKeys ? false : true
      type test_no_staff = Expect<HasStaff>
    })

    it('should preserve nullable types on required properties', () => {
      type Required = RequiredProperties<User>

      type test_surname_nullable = Expect<Equal<Required['surname'], string | null>>
      type test_age_nullable = Expect<Equal<Required['age'], number | null>>
    })
  })

  describe('OptionalProperties', () => {
    it('should extract only optional properties from Library', () => {
      type Optional = OptionalProperties<Library>

      type test_has_books = Expect<Equal<Optional['books'], Library['books']>>
      type test_has_members = Expect<Equal<Optional['members'], Library['members']>>
      type test_has_librarians = Expect<Equal<Optional['librarians'], Library['librarians']>>
      type test_has_events = Expect<Equal<Optional['events'], Library['events']>>

      type OptionalKeys = keyof Optional
      type HasId = 'id' extends OptionalKeys ? false : true
      type test_no_id = Expect<HasId>

      type HasName = 'name' extends OptionalKeys ? false : true
      type test_no_name = Expect<HasName>
    })

    it('should extract only optional properties from User', () => {
      type Optional = OptionalProperties<User>

      type test_has_posts = Expect<Equal<Optional['posts'], User['posts']>>
      type test_has_manager = Expect<Equal<Optional['manager'], User['manager']>>

      type OptionalKeys = keyof Optional
      type HasId = 'id' extends OptionalKeys ? false : true
      type test_no_id = Expect<HasId>

      type HasEmail = 'email' extends OptionalKeys ? false : true
      type test_no_email = Expect<HasEmail>
    })

    it('should work with LibraryBranch', () => {
      type Optional = OptionalProperties<LibraryBranch>

      type test_has_staff = Expect<Equal<Optional['staff'], LibraryBranch['staff']>>
      type test_has_mainLibrary = Expect<Equal<Optional['mainLibrary'], LibraryBranch['mainLibrary']>>

      type OptionalKeys = keyof Optional
      type HasId = 'id' extends OptionalKeys ? false : true
      type test_no_id = Expect<HasId>
    })
  })

  describe('ExpandedOptionalProperties', () => {
    it('should remove undefined from single expanded property', () => {
      type Expanded = ExpandedOptionalProperties<Library, 'books'>

      type test_books = Expect<Equal<Expanded['books'], NonNullable<Library['books']>>>
    })

    it('should remove undefined from multiple expanded properties', () => {
      type Expanded = ExpandedOptionalProperties<Library, 'books' | 'members'>

      type test_books = Expect<Equal<Expanded['books'], NonNullable<Library['books']>>>
      type test_members = Expect<Equal<Expanded['members'], NonNullable<Library['members']>>>
    })

    it('should work with User navigation properties', () => {
      type Expanded = ExpandedOptionalProperties<User, 'posts'>

      // Post[] | null | undefined becomes Post[] | null (only undefined is removed)
      type PostArrayOrNull = Exclude<User['posts'], undefined>
      type test_posts = Expect<Equal<Expanded['posts'], PostArrayOrNull>>
    })

    it('should work with LibraryBranch', () => {
      type Expanded = ExpandedOptionalProperties<LibraryBranch, 'staff' | 'mainLibrary'>

      type test_staff = Expect<Equal<Expanded['staff'], NonNullable<LibraryBranch['staff']>>>
      type test_mainLibrary = Expect<Equal<Expanded['mainLibrary'], NonNullable<LibraryBranch['mainLibrary']>>>
    })

    it('should handle empty expansion', () => {
      type Expanded = ExpandedOptionalProperties<Library, never>

      type test_empty = Expect<Equal<Expanded, {}>>
    })
  })

  describe('SelectedProperties', () => {
    it('should create type with only selected properties', () => {
      type Selected = SelectedProperties<Library, 'id' | 'name'>

      type test_exact = Expect<Equal<Selected, { id: string; name: string }>>
    })

    it('should work with single property', () => {
      type Selected = SelectedProperties<Library, 'id'>

      type test_exact = Expect<Equal<Selected, { id: string }>>
    })

    it('should preserve property types exactly', () => {
      type Selected = SelectedProperties<Library, 'type' | 'address'>

      type test_type = Expect<Equal<Selected['type'], 'public' | 'academic' | 'special'>>
      type test_address = Expect<Equal<Selected['address'], Library['address']>>
    })

    it('should work with nullable properties', () => {
      type Selected = SelectedProperties<User, 'surname' | 'age'>

      type test_surname = Expect<Equal<Selected['surname'], string | null>>
      type test_age = Expect<Equal<Selected['age'], number | null>>
    })
  })

  describe('IntersectTypes and Prettify', () => {
    it('should combine two types correctly', () => {
      type Type1 = { id: string; name: string }
      type Type2 = { age: number }
      type Combined = IntersectTypes<Type1, Type2>

      type test_has_id = Expect<Equal<Combined['id'], string>>
      type test_has_name = Expect<Equal<Combined['name'], string>>
      type test_has_age = Expect<Equal<Combined['age'], number>>
    })

    it('should combine required and expanded properties', () => {
      type Required = RequiredProperties<Library>
      type Expanded = ExpandedOptionalProperties<Library, 'books'>
      type Combined = IntersectTypes<Required, Expanded>

      type test_has_id = Expect<Equal<Combined['id'], string>>
      type test_has_name = Expect<Equal<Combined['name'], string>>
      type test_has_books = Expect<Equal<Combined['books'], NonNullable<Library['books']>>>
    })

    it('should combine three types correctly', () => {
      type Type1 = { id: string }
      type Type2 = { name: string }
      type Type3 = { age: number }
      type Combined = IntersectTypes<IntersectTypes<Type1, Type2>, Type3>

      type test_exact = Expect<Equal<Combined, { id: string; name: string; age: number }>>
    })

    it('should handle empty object intersection', () => {
      type Type1 = { id: string }
      type Type2 = {}
      type Combined = IntersectTypes<Type1, Type2>

      type test_has_id = Expect<Equal<Combined['id'], string>>
    })

    it('should work with computed fields', () => {
      type Base = RequiredProperties<Library>
      type Computed = { displayName: string; totalBooks: number }
      type Combined = IntersectTypes<Base, Computed>

      type test_has_id = Expect<Equal<Combined['id'], string>>
      type test_has_displayName = Expect<Equal<Combined['displayName'], string>>
      type test_has_totalBooks = Expect<Equal<Combined['totalBooks'], number>>
    })
  })

  describe('Prettify', () => {
    it('should flatten intersection types', () => {
      type Intersection = { id: string } & { name: string } & { age: number }
      type Flattened = Prettify<Intersection>

      type Expected = { id: string; name: string; age: number }
      type test_equal = Expect<Equal<Flattened, Expected>>
    })

    it('should preserve property types exactly', () => {
      type Complex = {
        id: string
        data: { nested: { value: number } }
        union: 'a' | 'b' | 'c'
      }
      type Prettified = Prettify<Complex>

      type test_data = Expect<Equal<Prettified['data'], { nested: { value: number } }>>
      type test_union = Expect<Equal<Prettified['union'], 'a' | 'b' | 'c'>>
    })
  })

  describe('Integration - Combined Utilities', () => {
    it('should work together for select scenario', () => {
      // Simulate: select('id', 'name', 'address')
      type Required = RequiredProperties<Library>
      type Selected = SelectedProperties<Required, 'id' | 'name' | 'address'>

      type test_exact = Expect<Equal<
        Selected,
        { id: string; name: string; address: Library['address'] }
      >>
    })

    it('should work together for expand scenario', () => {
      // Simulate: expand('books')
      type Required = RequiredProperties<Library>
      type Expanded = ExpandedOptionalProperties<Library, 'books'>
      type Combined = IntersectTypes<Required, Expanded>

      type test_has_id = Expect<Equal<Combined['id'], string>>
      type test_has_books = Expect<Equal<Combined['books'], NonNullable<Library['books']>>>
    })

    it('should work together for select + expand scenario', () => {
      // Simulate: select('id', 'name', 'books').expand('books')
      type Required = RequiredProperties<Library>
      type Selected = SelectedProperties<Required, 'id' | 'name'>
      type Expanded = ExpandedOptionalProperties<Library, 'books'>
      type Combined = IntersectTypes<Selected, Expanded>

      type test_has_id = Expect<Equal<Combined['id'], string>>
      type test_has_name = Expect<Equal<Combined['name'], string>>
      type test_has_books = Expect<Equal<Combined['books'], NonNullable<Library['books']>>>
    })

    it('should work together for select + expand + compute scenario', () => {
      // Simulate: select('id', 'books', 'total').expand('books').compute({ total: number })
      type Required = RequiredProperties<Library>
      type Selected = SelectedProperties<Required, 'id'>
      type Expanded = ExpandedOptionalProperties<Library, 'books'>
      type Computed = { total: number }
      type Combined = IntersectTypes<IntersectTypes<Selected, Expanded>, Computed>

      type test_has_id = Expect<Equal<Combined['id'], string>>
      type test_has_books = Expect<Equal<Combined['books'], NonNullable<Library['books']>>>
      type test_has_total = Expect<Equal<Combined['total'], number>>
    })
  })

  describe('Edge Cases and Constraints', () => {
    it('should handle entity with only required properties', () => {
      interface SimpleEntity {
        id: number
        name: string
      }

      type Required = RequiredProperties<SimpleEntity>
      type Optional = OptionalProperties<SimpleEntity>

      type test_required = Expect<Equal<Required, { id: number; name: string }>>
      type test_optional = Expect<Equal<Optional, {}>>
    })

    it('should handle entity with only optional properties', () => {
      interface OptionalEntity {
        id?: number
        name?: string
      }

      type Required = RequiredProperties<OptionalEntity>
      type Optional = OptionalProperties<OptionalEntity>

      type test_required = Expect<Equal<Required, {}>>

      type OptionalKeys = keyof Optional
      type HasId = 'id' extends OptionalKeys ? true : false
      type test_has_id = Expect<HasId>

      type HasName = 'name' extends OptionalKeys ? true : false
      type test_has_name = Expect<HasName>
    })

    it('should handle complex nested types', () => {
      type Selected = SelectedProperties<Library, 'address'>
      type AddressType = Selected['address']

      type test_street = Expect<Equal<AddressType['street'], string>>
      type test_city = Expect<Equal<AddressType['city'], string>>
      type test_state = Expect<Equal<AddressType['state'], string>>
      type test_zipCode = Expect<Equal<AddressType['zipCode'], string>>
    })
  })
})
