export const typeDefs = `#graphql
  """
  Category a book belongs to. Using an enum keeps the schema strict and
  self-documenting for clients.
  """
  enum Genre {
    SELF_HELP
    TECHNOLOGY
    HISTORY
    PRODUCTIVITY
    FICTION
  }

  """Sort order for list queries."""
  enum SortOrder {
    ASC
    DESC
  }

  """Fields a book list can be sorted by."""
  enum BookSortField {
    TITLE
    PRICE
    PUBLISHED_YEAR
    RATING
  }

  type Author {
    id: ID!
    name: String!
    bio: String!
    birthYear: Int!
    country: String!
    "All books written by this author. Batched with DataLoader to avoid N+1."
    books: [Book!]!
    bookCount: Int!
  }

  type Book {
    id: ID!
    title: String!
    price: Float!
    genre: Genre!
    publishedYear: Int!
    description: String!
    rating: Float!
    "Resolved through the authors DataLoader."
    author: Author!
  }

  """Filter criteria for the books query."""
  input BookFilter {
    search: String
    genre: Genre
    minPrice: Float
    maxPrice: Float
    minRating: Float
    authorId: ID
  }

  """Paginated list of books."""
  type BookConnection {
    items: [Book!]!
    total: Int!
    limit: Int!
    offset: Int!
  }

  type Query {
    "Paginated + filterable list of books."
    books(
      filter: BookFilter
      sortBy: BookSortField = TITLE
      sortOrder: SortOrder = ASC
      limit: Int = 10
      offset: Int = 0
    ): BookConnection!

    "Fetch a single book by ID."
    book(id: ID!): Book

    "List all authors."
    authors: [Author!]!

    "Fetch a single author by ID."
    author(id: ID!): Author
  }

  input CreateBookInput {
    title: String!
    price: Float!
    authorId: ID!
    genre: Genre!
    publishedYear: Int!
    description: String!
    rating: Float
  }

  input UpdateBookInput {
    title: String
    price: Float
    genre: Genre
    publishedYear: Int
    description: String
    rating: Float
  }

  input CreateAuthorInput {
    name: String!
    bio: String!
    birthYear: Int!
    country: String!
  }

  type DeleteResult {
    success: Boolean!
    id: ID!
  }

  type Mutation {
    createBook(input: CreateBookInput!): Book!
    updateBook(id: ID!, input: UpdateBookInput!): Book!
    deleteBook(id: ID!): DeleteResult!
    createAuthor(input: CreateAuthorInput!): Author!
  }
`;