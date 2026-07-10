# GraphQL Book API — Prompts

---

## 1. Schema Preparation

> Define a GraphQL schema for a book API. Include:
> - A `Book` type with fields: `id`, `title`, `price`, `genre` (enum), `publishedYear`, `description`, `rating`, and a linked `author`.
> - An `Author` type with fields: `id`, `name`, `bio`, `birthYear`, `country`, and a `books` list.
> - An `input` type `BookFilter` for filtering by `search`, `genre`, `minPrice`, `maxPrice`, `minRating`, and `authorId`.
> - A `BookConnection` type for paginated results with `items`, `total`, `limit`, and `offset`.
> - `Query` fields: `books` (paginated + filtered), `book(id)`, `authors`, `author(id)`.
> - `Mutation` fields: `addBook`, `updateBook`, `deleteBook`, `addAuthor`.

---

## 2. Schema Review

> Review the following GraphQL schema and suggest improvements:
> - Are nullable vs non-null (`!`) types used appropriately?
> - Are enums used where values are fixed (e.g., `Genre`, `SortOrder`)?
> - Is pagination handled correctly using a connection/wrapper type?
> - Are input types used for mutations and complex filters instead of inline arguments?
> - Are there any missing fields, redundant types, or naming inconsistencies?

---

## 3. N+1 Problem + Fix

> Explain the N+1 problem in the context of this GraphQL API where querying a list of books
> also resolves each book's `author` field individually. Show:
> 1. What naive resolver code causes the N+1 problem (one DB/data call per book).
> 2. How to fix it using **DataLoader** — batch all author IDs from a book list into a
>    single lookup, then return each author from the batch result.
> Provide a TypeScript DataLoader implementation that batches author lookups by ID.

---

## 4. Client Query (Nested) to Fix N+1 Problem

> Write a GraphQL client query that fetches a list of books with their nested author details.
> The query should be structured so that the server can batch-resolve authors via DataLoader
> instead of making one request per book. Include:
> - `books` query with pagination (`limit`, `offset`)
> - Nested `author` fields: `id`, `name`, `country`
> - Optional: also fetch `author.books` to demonstrate deep nesting handled by DataLoader
>
> Example:
> ```graphql
> query GetBooksWithAuthors($limit: Int, $offset: Int) {
>   books(limit: $limit, offset: $offset) {
>     items {
>       id
>       title
>       rating
>       author {
>         id
>         name
>         country
>         books {
>           title
>         }
>       }
>     }
>     total
>   }
> }
> ```

---

## 5. Filtering Nested Query

> Write a GraphQL query that filters books using the `BookFilter` input and returns nested
> author information. The filter should support:
> - `search` — partial match on book title or description
> - `genre` — filter by a specific `Genre` enum value (e.g., `TECHNOLOGY`)
> - `minRating` — only return books at or above a rating threshold
> - `minPrice` / `maxPrice` — price range
>
> Example:
> ```graphql
> query FilterBooks($filter: BookFilter!, $limit: Int) {
>   books(filter: $filter, limit: $limit, sortBy: RATING, sortOrder: DESC) {
>     items {
>       id
>       title
>       genre
>       rating
>       price
>       author {
>         id
>         name
>       }
>     }
>     total
>     limit
>     offset
>   }
> }
> ```
>
> Variables:
> ```json
> {
>   "filter": {
>     "genre": "TECHNOLOGY",
>     "minRating": 4.0,
>     "minPrice": 10,
>     "maxPrice": 50
>   },
>   "limit": 5
> }
> ```
