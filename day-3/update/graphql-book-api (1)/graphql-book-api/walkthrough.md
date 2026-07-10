# GraphQL Book API — Training Walkthrough

A hands-on, production-shaped Apollo Server + TypeScript demo covering:

1. **GraphQL schema design** (SDL, enums, input types, connections)
2. **Resolvers** (queries, mutations, field resolvers)
3. **Query optimization** (batching + caching with `DataLoader` to fix the N+1 problem)
4. **AI-assisted schema evolution** (prompts you can reuse with Copilot)

Follow the sections in order during your training session.

---

## 1. Prerequisites

- **Node.js 18+** and **npm 9+**
  ```powershell
  node --version
  npm --version
  ```
- Any editor (VS Code recommended)
- A modern browser (for the built-in Apollo Sandbox)

---

## 2. Project Layout

```
graphql-book-api/
├── package.json
├── tsconfig.json
├── walkthrough.md        <-- you are here
├── README.md
└── src/
    ├── server.ts         # Apollo Server bootstrap
    ├── schema.ts         # GraphQL SDL (types, inputs, enums)
    ├── resolvers.ts      # Query / Mutation / field resolvers
    ├── context.ts        # Per-request context + DataLoaders (N+1 fix)
    └── data/
        ├── authors.ts    # In-memory authors (5 seeded)
        └── books.ts      # In-memory books   (6 seeded)
```

---

## 3. Setup

From the project root:

```powershell
npm install
```

Start the server in watch mode:

```powershell
npm run dev
```

Or a plain run:

```powershell
npm start
```

You should see:

```
GraphQL Book API ready at http://localhost:4000/
```

Open <http://localhost:4000/> — the Apollo Sandbox opens automatically and gives you an in-browser IDE with schema introspection, autocomplete, and docs.

Other useful scripts:

| Command            | Purpose                          |
|--------------------|----------------------------------|
| `npm run dev`      | Hot-reload dev server            |
| `npm start`        | One-shot run with `ts-node`      |
| `npm run build`    | Compile TypeScript to `dist/`    |
| `npm run serve`    | Run compiled JS from `dist/`     |
| `npm run typecheck`| Type-check only, no emit         |

---

## 4. Schema Walkthrough

Open [src/schema.ts](src/schema.ts). Key ideas to point out:

- **Enums** (`Genre`, `SortOrder`, `BookSortField`) — strict, self-documenting.
- **Input types** (`BookFilter`, `CreateBookInput`, `UpdateBookInput`, `CreateAuthorInput`) — keep query arguments composable.
- **Connection pattern** (`BookConnection` with `items`, `total`, `limit`, `offset`) — a clean way to expose paginated lists.
- **Field-level docstrings** (`""" ... """`) — surface directly in Sandbox / Codegen.
- **Bidirectional relation**: `Book.author` and `Author.books` — the classic setup that causes the N+1 problem.

---

## 5. Resolver Walkthrough

Open [src/resolvers.ts](src/resolvers.ts).

- **Query resolvers** perform filter → sort → paginate on the in-memory list.
- **Field resolvers** (`Book.author`, `Author.books`, `Author.bookCount`) load related data via `ctx.loaders.*` (see next section).
- **Mutations** validate input and throw `GraphQLError` with a proper `code` in `extensions` — this is how Apollo surfaces machine-readable errors to clients.
- **Input validation** lives at the resolver boundary — the pattern to use even when you later plug in a real database.

---

## 6. Query Optimization — Fixing N+1 with DataLoader

Open [src/context.ts](src/context.ts).

The classic bug: for a query like

```graphql
query {
  books(limit: 50) {
    items { title author { name } }
  }
}
```

a naïve resolver fires **1 query for books + 50 queries for authors** = 51 round trips.

`DataLoader` fixes this by:

- **Batching** every `.load(id)` call in the same tick into a single batch function call.
- **Caching** repeated `.load(id)` for the same key within one request.

In this project:

- `createContext()` returns a **fresh loader instance per request** (critical — never share across requests).
- The batch functions log `[loader] authorById batch size=N` so you can *see* batching in the terminal.

### Try it live

Run this in Sandbox with the server terminal visible:

```graphql
query BatchDemo {
  books(limit: 50) {
    items {
      id
      title
      author { id name }
    }
  }
}
```

You'll see **one** `[loader] authorById batch size=6` log line — not six.

Ask a follow-up query that touches the reverse side:

```graphql
query ReverseBatch {
  authors {
    id
    name
    bookCount
    books { id title }
  }
}
```

One `booksByAuthorId` batch, regardless of how many authors are returned.

---

## 7. Try These Queries (copy into Sandbox)

### 7.1 Filter, sort, paginate

```graphql
query TopTech {
  books(
    filter: { genre: TECHNOLOGY, minRating: 4.5 }
    sortBy: RATING
    sortOrder: DESC
    limit: 5
  ) {
    total
    items { id title rating price }
  }
}
```

### 7.2 Full-text-ish search

```graphql
query Search {
  books(filter: { search: "code" }) {
    total
    items { title description }
  }
}
```

### 7.3 Author with their books

```graphql
query UncleBob {
  author(id: "2") {
    name
    bio
    bookCount
    books { title publishedYear }
  }
}
```

### 7.4 Create a book

```graphql
mutation AddBook {
  createBook(input: {
    title: "So Good They Can't Ignore You"
    price: 480
    authorId: "4"
    genre: PRODUCTIVITY
    publishedYear: 2012
    description: "Why skills trump passion in the quest for work you love."
    rating: 4.5
  }) {
    id title author { name }
  }
}
```

### 7.5 Update / delete

```graphql
mutation Bump {
  updateBook(id: "1", input: { price: 525, rating: 4.9 }) {
    id price rating
  }
}

mutation Remove {
  deleteBook(id: "6") { success id }
}
```

### 7.6 Error surface (proves validation works)

```graphql
mutation Bad {
  createBook(input: {
    title: "Bad"
    price: -1
    authorId: "1"
    genre: FICTION
    publishedYear: 2024
    description: "-"
  }) { id }
}
```

Response includes `extensions.code = "BAD_USER_INPUT"`.

---

## 8. AI-Assisted Schema & Query Optimization

Use these Copilot prompts (or any LLM) as classroom exercises:

### 8.1 Schema generation

> "Extend `src/schema.ts` with a `Review` type (id, bookId, reviewer, rating 1–5, comment, createdAt as ISO string). Add a `book.reviews` field, a `createReview` mutation, and a `reviewsByBook(bookId: ID!)` query. Keep it consistent with existing enum + input-type patterns."

### 8.2 Query optimization suggestion

Paste a query into chat and ask:

> "Given this GraphQL query and my resolvers in `src/resolvers.ts`, identify any N+1 risks and propose DataLoader batches or field-level caching. Show the diff."

### 8.3 Persisted safety

> "Suggest a `depthLimit` and `costAnalysis` plugin for Apollo Server 4 to reject expensive nested queries. Provide the exact wiring in `src/server.ts`."

### 8.4 Data-model refactor

> "Convert the in-memory arrays in `src/data/*.ts` to a Prisma schema targeting SQLite, and rewrite resolvers to use the Prisma client while preserving the DataLoader batching layer."

---

## 9. Production Hardening Checklist

What to point out as "next steps" for real deployments:

- [ ] Replace in-memory arrays with a real database (Postgres + Prisma is a great next lesson).
- [ ] Add **authentication** (JWT / session) and pass `user` on `AppContext`.
- [ ] Add **query cost / depth limits** (`graphql-depth-limit`, `graphql-query-complexity`).
- [ ] Turn **introspection off in production** or gate it behind a role.
- [ ] Add **Apollo Server plugins** for logging, tracing (OpenTelemetry), and metrics.
- [ ] Add **automated tests** (`vitest` + `@apollo/server` `executeOperation`).
- [ ] Containerize with a multi-stage `Dockerfile` (`npm run build` → `node dist/server.js`).
- [ ] Add CI: `npm ci`, `npm run typecheck`, `npm run build`, tests.

---

## 10. Troubleshooting

| Symptom                              | Fix                                                                  |
|--------------------------------------|----------------------------------------------------------------------|
| `Cannot find module '@apollo/server'`| Run `npm install` from the project root.                             |
| Port 4000 already in use             | `set PORT=4001` (cmd) or `$env:PORT=4001` (pwsh) then `npm start`.   |
| Sandbox doesn't load                 | Visit <http://localhost:4000/> in a fresh tab; disable ad-blockers.  |
| Type errors after edits              | Run `npm run typecheck` — resolver arg types drift with schema.      |
| Mutations "work" but data resets     | Expected — data is in-memory; process restart clears it.             |

---

Happy training! End with a live coding round: pick one item from section 8 or 9 and implement it with the class.
