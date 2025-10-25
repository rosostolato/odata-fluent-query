import { odataQuery } from '../src'
import { Library, LibraryBranch } from './data/library'
import { User } from './data/user'
import { Equal, Expect } from 'type-testing'

describe('Type Getter with Enhanced TypeScript Testing', () => {
  it('should have type property available', () => {
    const query = odataQuery<Library>()
    expect(typeof query.type).toBe('object')
  })

  it('should return an object from type property', () => {
    const query = odataQuery<Library>()
    expect(typeof query.type).toBe('object')
  })

  describe('Real-world Usage Pattern Tests', () => {
    it('should work with service functions that use type inference', () => {
      function createLibraryService() {
        const getLibrarySummary = () => {
          const query = odataQuery<Library>().select(
            'id',
            'name',
            'type',
            'address'
          )

          type LibrarySummary = typeof query.type

          // Type tests: validate that .type correctly infers selected properties
          type test_has_id = Expect<Equal<LibrarySummary['id'], string>>
          type test_has_name = Expect<Equal<LibrarySummary['name'], string>>
          type test_has_type = Expect<
            Equal<LibrarySummary['type'], 'public' | 'academic' | 'special'>
          >
          type test_has_address = Expect<
            Equal<
              LibrarySummary['address'],
              {
                street: string
                city: string
                state: string
                zipCode: string
              }
            >
          >

          type LibraryKeys = keyof LibrarySummary
          type BooksNotInKeys = 'books' extends LibraryKeys ? false : true
          type test_no_books = Expect<BooksNotInKeys>

          const processLibraries = (libraries: LibrarySummary[]): string[] => {
            return libraries.map(
              library => `${library.id}: ${library.name} (${library.type})`
            )
          }

          return { query, processLibraries }
        }

        const getLibrariesWithBooks = () => {
          const query = odataQuery<Library>()
            .select('id', 'name', 'books')
            .expand('books')

          type LibraryWithBooks = typeof query.type

          // Type tests: validate expanded navigation properties are included without undefined
          type test_has_id = Expect<Equal<LibraryWithBooks['id'], string>>
          type test_has_name = Expect<Equal<LibraryWithBooks['name'], string>>
          type test_has_books = Expect<
            Equal<
              LibraryWithBooks['books'],
              Array<{
                id: string
                title: string
                author: string
                isbn: string
                isAvailable: boolean
              }>
            >
          >

          type LibraryWithBooksKeys = keyof LibraryWithBooks
          type AddressNotInKeys = 'address' extends LibraryWithBooksKeys
            ? false
            : true
          type test_no_address = Expect<AddressNotInKeys>

          const calculateTotalBooks = (
            libraries: LibraryWithBooks[]
          ): number => {
            return libraries.reduce(
              (total, library) => total + (library.books?.length || 0),
              0
            )
          }

          return { query, calculateTotalBooks }
        }

        return { getLibrarySummary, getLibrariesWithBooks }
      }

      const service = createLibraryService()
      const summaryService = service.getLibrarySummary()
      const booksService = service.getLibrariesWithBooks()

      // Test the service functions work
      expect(typeof summaryService.processLibraries).toBe('function')
      expect(typeof booksService.calculateTotalBooks).toBe('function')

      // Test query generation
      expect(summaryService.query.toString()).toBe(
        '$select=id,name,type,address'
      )
      expect(booksService.query.toString()).toBe(
        '$expand=books&$select=id,name,books'
      )
    })

    it('should support API response typing patterns', () => {
      function createLibraryApiClient() {
        const fetchLibraryProfile = () => {
          const query = odataQuery<LibraryBranch>().select(
            'id',
            'name',
            'branchCode',
            'location'
          )

          type BranchProfile = typeof query.type

          const mockFetch = async (): Promise<BranchProfile[]> => {
            return [
              {
                id: 'branch-1',
                name: 'Downtown Branch',
                branchCode: 'DT001',
                location: {
                  address: '123 Main St',
                  city: 'Seattle',
                  phone: '+1-206-555-0123',
                },
              },
            ]
          }

          return { query, mockFetch }
        }

        const fetchBranchWithStaff = () => {
          const query = odataQuery<LibraryBranch>()
            .expand('staff')
            .expand('mainLibrary')
            .select('id', 'name', 'staff', 'mainLibrary')

          type BranchWithStaff = typeof query.type

          const mockFetch = async (): Promise<BranchWithStaff[]> => {
            return [
              {
                id: 'branch-1',
                name: 'Downtown Branch',
                staff: [
                  { id: 'staff-1', name: 'John Doe', role: 'Librarian' },
                  { id: 'staff-2', name: 'Jane Smith', role: 'Assistant' },
                ],
                mainLibrary: {
                  id: 'lib-1',
                  name: 'Central Library',
                  established: new Date('1950-01-01'),
                },
              },
            ]
          }

          return { query, mockFetch }
        }

        return { fetchLibraryProfile, fetchBranchWithStaff }
      }

      const client = createLibraryApiClient()
      const profileClient = client.fetchLibraryProfile()
      const staffClient = client.fetchBranchWithStaff()

      // Test the API functions work
      expect(typeof profileClient.mockFetch).toBe('function')
      expect(typeof staffClient.mockFetch).toBe('function')

      // Test query generation
      expect(profileClient.query.toString()).toBe(
        '$select=id,name,branchCode,location'
      )
      expect(staffClient.query.toString()).toBe(
        '$expand=staff,mainLibrary&$select=id,name,staff,mainLibrary'
      )
    })

    it('should work with computed field scenarios', () => {
      function createComputedQueries() {
        const libraryDisplayQuery = () => {
          const query = odataQuery<Library>()
            .compute(c => c.name.concat(' - ', c.type).as('displayName'))
            .select('id', 'displayName')

          type LibraryDisplay = typeof query.type

          // Type tests: validate computed fields are included in result type
          type test_has_id = Expect<Equal<LibraryDisplay['id'], string>>
          type test_has_displayName = Expect<
            Equal<LibraryDisplay['displayName'], string>
          >

          type LibraryDisplayKeys = keyof LibraryDisplay
          type NameNotInKeys = 'name' extends LibraryDisplayKeys ? false : true
          type test_no_name = Expect<NameNotInKeys>

          const formatLibraries = (libraries: LibraryDisplay[]): string => {
            return libraries
              .map(library => `ID: ${library.id}, Name: ${library.displayName}`)
              .join(', ')
          }

          return { query, formatLibraries }
        }

        const complexComputeQuery = () => {
          const query = odataQuery<Library>()
            .compute(c =>
              c.name
                .concat(' (Est. ', c.established.year().toString(), ')')
                .as('nameWithYear')
            )
            .select('id', 'nameWithYear')

          type ComplexResult = typeof query.type

          const processResults = (results: ComplexResult[]): number => {
            return results.length
          }

          return { query, processResults }
        }

        return { libraryDisplayQuery, complexComputeQuery }
      }

      const queries = createComputedQueries()
      const displayQuery = queries.libraryDisplayQuery()
      const complexQuery = queries.complexComputeQuery()

      expect(typeof displayQuery.formatLibraries).toBe('function')
      expect(typeof complexQuery.processResults).toBe('function')

      expect(displayQuery.query.toString()).toBe(
        "$select=id,displayName&$compute=concat(concat(name,' - '),type) as displayName"
      )
      expect(complexQuery.query.toString()).toContain('$select=id,nameWithYear')
      expect(complexQuery.query.toString()).toContain('$compute=')
    })
  })

  describe('Type System Validation', () => {
    it('should allow only valid expand operations at compile time', () => {
      const query = odataQuery<Library>()

      const validExpands = [
        query.expand('books'),
        query.expand('members'),
        query.expand('librarians'),
        query.expand('events'),
      ]

      expect(validExpands.length).toBe(4)

      // Note: TypeScript compiler prevents invalid expands like query.expand('name')
      // This is validated at compile-time, not runtime
    })

    it('should properly chain operations while preserving types', () => {
      function testOperationChaining() {
        const complexQuery = odataQuery<Library>()
          .filter(l => l.isOpen.equals(true))
          .select('id', 'name', 'type', 'members')
          .expand('members')
          .orderBy(l => l.name)
          .paginate(1, 10)
          .count()

        type ChainedResult = typeof complexQuery.type

        // Type tests: chained operations preserve correct types
        type test_has_id = Expect<Equal<ChainedResult['id'], string>>
        type test_has_name = Expect<Equal<ChainedResult['name'], string>>
        type test_has_type = Expect<
          Equal<ChainedResult['type'], 'public' | 'academic' | 'special'>
        >
        type test_has_members = Expect<
          Equal<
            ChainedResult['members'],
            Array<{
              id: string
              name: string
              email: string
              joinDate: Date
              isActive: boolean
            }>
          >
        >

        type ChainedResultKeys = keyof ChainedResult
        type BooksNotInKeys = 'books' extends ChainedResultKeys ? false : true
        type test_no_books = Expect<BooksNotInKeys>

        const processChainedResult = (result: ChainedResult): string => {
          return `Library ${result.id}: ${result.name} (${result.type})`
        }

        return { complexQuery, processChainedResult }
      }

      const test = testOperationChaining()

      expect(typeof test.processChainedResult).toBe('function')
      expect(test.complexQuery.toString()).toContain(
        '$select=id,name,type,members'
      )
      expect(test.complexQuery.toString()).toContain('$expand=members')
      expect(test.complexQuery.toString()).toContain('$filter=')
      expect(test.complexQuery.toString()).toContain('$orderby=')
      expect(test.complexQuery.toString()).toContain('$top=')
      expect(test.complexQuery.toString()).toContain('$count=true')
    })
  })

  describe('Multiple Entity Types', () => {
    it('should work with different entity types', () => {
      // Test Library
      const libraryQuery = odataQuery<Library>()
        .select('id', 'name', 'address')
        .expand('books')

      type LibraryResult = typeof libraryQuery.type

      const processLibrary = (library: LibraryResult): string => {
        return `${library.name} in ${library.address.city}`
      }

      // Test LibraryBranch
      const branchQuery = odataQuery<LibraryBranch>()
        .select('id', 'name', 'location')
        .expand('staff')

      type BranchResult = typeof branchQuery.type

      const processBranch = (branch: BranchResult): string => {
        return `${branch.name} in ${branch.location.city}`
      }

      expect(typeof processLibrary).toBe('function')
      expect(typeof processBranch).toBe('function')
      expect(libraryQuery.toString()).toBe(
        '$expand=books&$select=id,name,address'
      )
      expect(branchQuery.toString()).toBe(
        '$expand=staff&$select=id,name,location'
      )
    })

    it('should handle nested entity relationships', () => {
      // Test LibraryBranch with collections relationship
      const branchWithCollectionsQuery = odataQuery<LibraryBranch>()
        .select('id', 'name', 'collections')
        .expand('collections')

      type BranchWithCollections = typeof branchWithCollectionsQuery.type

      const calculateTotalItems = (branch: BranchWithCollections): number => {
        return (
          branch.collections?.reduce(
            (total, collection) => total + collection.itemCount,
            0
          ) || 0
        )
      }

      expect(typeof calculateTotalItems).toBe('function')
      expect(branchWithCollectionsQuery.toString()).toBe(
        '$expand=collections&$select=id,name,collections'
      )
    })
  })

  describe('Backward Compatibility', () => {
    it('should work with existing User interface', () => {
      const query = odataQuery<User>().select('id', 'email')

      type UserResult = typeof query.type

      const processUser = (user: UserResult): string => {
        return `${user.id}: ${user.email}`
      }

      expect(typeof processUser).toBe('function')
      expect(query.toString()).toBe('$select=id,email')
    })

    it('should handle edge cases gracefully', () => {
      const emptyQuery = odataQuery<Library>()
      type EmptyResult = typeof emptyQuery.type

      type test_empty_has_id = Expect<Equal<EmptyResult['id'], string>>
      type test_empty_has_name = Expect<Equal<EmptyResult['name'], string>>

      type EmptyResultKeys = keyof EmptyResult
      type EmptyBooksNotInKeys = 'books' extends EmptyResultKeys ? false : true
      type test_empty_no_books = Expect<EmptyBooksNotInKeys>

      expect(typeof emptyQuery.type).toBe('object')
      expect(emptyQuery.toString()).toBe('')

      const selectOnlyQuery = odataQuery<Library>().select('id')
      type SelectOnlyResult = typeof selectOnlyQuery.type

      type test_select_has_id = Expect<Equal<SelectOnlyResult['id'], string>>

      type SelectOnlyResultKeys = keyof SelectOnlyResult
      type SelectNameNotInKeys = 'name' extends SelectOnlyResultKeys
        ? false
        : true
      type test_select_no_name = Expect<SelectNameNotInKeys>

      expect(typeof selectOnlyQuery.type).toBe('object')
      expect(selectOnlyQuery.toString()).toBe('$select=id')

      const expandOnlyQuery = odataQuery<Library>().expand('books')
      type ExpandOnlyResult = typeof expandOnlyQuery.type

      type test_expand_has_id = Expect<Equal<ExpandOnlyResult['id'], string>>
      type test_expand_has_books = Expect<
        Equal<
          ExpandOnlyResult['books'],
          Array<{
            id: string
            title: string
            author: string
            isbn: string
            isAvailable: boolean
          }>
        >
      >

      expect(typeof expandOnlyQuery.type).toBe('object')
      expect(expandOnlyQuery.toString()).toBe('$expand=books')

      const countQuery = odataQuery<Library>().select('id', 'name').count()
      type CountResult = typeof countQuery.type

      type test_count_has_id = Expect<Equal<CountResult['id'], string>>
      type test_count_has_name = Expect<Equal<CountResult['name'], string>>

      expect(typeof countQuery.type).toBe('object')
      expect(countQuery.toString()).toBe('$select=id,name&$count=true')
    })
  })

  describe('Developer Experience Tests', () => {
    it('should provide helpful IntelliSense in realistic scenarios', () => {
      function demonstrateIntelliSense() {
        const dashboardQuery = odataQuery<Library>()
          .select('id', 'name', 'type', 'info')
          .filter(l => l.isOpen.equals(true))
          .orderBy(l => l.name)
          .paginate(1, 20)

        type DashboardLibrary = typeof dashboardQuery.type

        const detailQuery = odataQuery<Library>()
          .expand('books')
          .expand('members')
          .filter(l => l.id.equals('lib-123'))

        type DetailedLibrary = typeof detailQuery.type

        const renderDashboard = (libraries: DashboardLibrary[]) =>
          libraries.length
        const renderDetails = (library: DetailedLibrary) =>
          library.name || 'Unknown'

        return {
          dashboardQuery,
          detailQuery,
          renderDashboard,
          renderDetails,
        }
      }

      const demo = demonstrateIntelliSense()

      expect(typeof demo.renderDashboard).toBe('function')
      expect(typeof demo.renderDetails).toBe('function')
      expect(demo.dashboardQuery.toString()).toContain(
        '$select=id,name,type,info'
      )
      expect(demo.detailQuery.toString()).toBe(
        "$filter=id eq 'lib-123'&$expand=books,members"
      )
    })
  })
})
