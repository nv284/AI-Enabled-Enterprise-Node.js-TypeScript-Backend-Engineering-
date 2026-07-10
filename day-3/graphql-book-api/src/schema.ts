
import { gql } from "graphql-tag";

export const typeDefs = gql`
scalar DateTime
scalar Money
scalar Email
scalar ISBN
scalar Cursor

interface Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum SortOrder { ASC DESC }
enum BookStatus { AVAILABLE OUT_OF_STOCK DISCONTINUED }
enum BookSortField { TITLE PRICE PUBLISHED_DATE CREATED_AT UPDATED_AT }
enum AuthorSortField { NAME CREATED_AT UPDATED_AT }

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: Cursor
  endCursor: Cursor
}

input PaginationInput {
  first: Int
  after: Cursor
  last: Int
  before: Cursor
}

input BookFilterInput {
  title: String
  isbn: ISBN
  authorId: ID
  status: BookStatus
  minPrice: Money
  maxPrice: Money
}

input AuthorFilterInput {
  name: String
  email: Email
}

input BookSortInput {
  field: BookSortField!
  order: SortOrder!
}

input AuthorSortInput {
  field: AuthorSortField!
  order: SortOrder!
}

type Category implements Node {
  id: ID!
  name: String!
  books: [Book!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Publisher implements Node {
  id: ID!
  name: String!
  books: [Book!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Review implements Node {
  id: ID!
  rating: Int!
  comment: String
  book: Book!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Author implements Node {
  id: ID!
  name: String!
  email: Email
  biography: String
  books: [Book!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Book implements Node {
  id: ID!
  title: String!
  description: String
  isbn: ISBN!
  price: Money!
  status: BookStatus!
  publishedDate: DateTime
  author: Author!
  category: Category
  publisher: Publisher
  reviews: [Review!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type BookEdge { cursor: Cursor! node: Book! }
type BookConnection { edges: [BookEdge!]! totalCount: Int! pageInfo: PageInfo! }
type AuthorEdge { cursor: Cursor! node: Author! }
type AuthorConnection { edges: [AuthorEdge!]! totalCount: Int! pageInfo: PageInfo! }

input CreateBookInput {
  title: String!
  description: String
  isbn: ISBN!
  price: Money!
  authorId: ID!
  categoryId: ID
  publisherId: ID
}

input UpdateBookInput {
  title: String
  description: String
  isbn: ISBN
  price: Money
  status: BookStatus
  authorId: ID
  categoryId: ID
  publisherId: ID
}

input CreateAuthorInput {
  name: String!
  email: Email
  biography: String
}

input UpdateAuthorInput {
  name: String
  email: Email
  biography: String
}

type DeletePayload {
  success: Boolean!
  message: String!
}

type Query {
  book(id: ID!): Book
  books(pagination: PaginationInput, filter: BookFilterInput, sort: [BookSortInput!]): BookConnection!
  author(id: ID!): Author
  authors(pagination: PaginationInput, filter: AuthorFilterInput, sort: [AuthorSortInput!]): AuthorConnection!
}

type Mutation {
  createBook(input: CreateBookInput!): Book!
  updateBook(id: ID!, input: UpdateBookInput!): Book!
  deleteBook(id: ID!): DeletePayload!
  createAuthor(input: CreateAuthorInput!): Author!
  updateAuthor(id: ID!, input: UpdateAuthorInput!): Author!
  deleteAuthor(id: ID!): DeletePayload!
}
`;

