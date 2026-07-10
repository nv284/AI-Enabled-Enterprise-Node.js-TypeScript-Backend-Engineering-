# Book Management API

A small, teachable Book Management REST API implemented with TypeScript and Node.js. The project demonstrates Clean Architecture, Repository Pattern, Service Layer, Dependency Injection (tsyringe), and runtime validation with zod. It is intentionally minimal to fit a single training session while following industry best practices and clear separation of concerns.

---

## Project overview

This application exposes a simple REST API to manage books (create, read, update, delete). It is designed for teaching architecture, not for production readiness (no authentication, no external configuration, and a deliberate focus on clarity over feature bloat).

Key principles demonstrated:
- Clean Architecture (entities, use-cases, interface adapters, infrastructure)
- Repository pattern (domain-facing repository interface + concrete SQLite implementation)
- Service layer (business logic / use-cases)
- Dependency injection (tsyringe) and inversion of control
- Request validation at the boundary (zod)
- Separation of concerns and SOLID design

---

## Architecture summary

Layers (inner → outer)
- Entities / Domain
  - Pure TypeScript types/models (Book).
  - No framework or infrastructure dependencies.
- Use-cases / Services
  - Business rules and orchestration (BookService).
  - Depend on repository interfaces (abstractions), not concrete implementations.
- Interface Adapters
  - Controllers, request validation (zod), and route wiring — adapt HTTP to use-cases.
  - Error handling middleware translates domain errors to HTTP responses.
- Infrastructure / Frameworks
  - SQLite access (better-sqlite3), repository implementations, Express server, DI container.
  - Concrete implementations live here and are injected into inner layers via tsyringe.

Dependency direction
- Outer layers depend on interfaces/abstractions defined in inner layers.
- BookService → IBookRepository (interface)
- SqliteBookRepository → db/sqlite.ts and models/Book
- container.ts binds IBookRepository → SqliteBookRepository at boot

Design notes
- better-sqlite3 is synchronous by design. The repository uses it directly (synchronous I/O) for simplicity in a training environment; the service layer can still expose Promise-returning APIs if desired for portability.
- Validation is performed at the controller boundary with zod to keep services focused on business rules.
- No generic repository: repository interface is specific and intentionally small.

---

## Folder structure

Top-level (minimal):
```
.
├── package.json
├── tsconfig.json
├── README.md
└── src
    ├── server.ts              # application bootstrap (imports reflect-metadata, starts server)
    ├── app.ts                 # express app configuration and middleware
    ├── container.ts           # dependency registrations (tsyringe)
    ├── db
    │   └── sqlite.ts          # SQLite connection & schema initialization (better-sqlite3)
    ├── models
    │   └── Book.ts            # domain type / entity
    ├── repositories
    │   ├── IBookRepository.ts # repository interface (contract)
    │   └── SqliteBookRepository.ts # concrete implementation using SQLite
    ├── services
    │   └── BookService.ts     # use-cases / business logic
    ├── controllers
    │   └── BookController.ts  # HTTP handlers and zod validation
    ├── routes
    │   └── bookRoutes.ts      # express Router for books
    └── middleware
        └── errorHandler.ts    # central error handling & translation
```

Purpose of the important files
- `src/server.ts` — single entry point: import metadata polyfill, register DI, create app and listen.
- `src/app.ts` — configures Express (body parser, routes, error handler) and exports the app.
- `src/container.ts` — tsyringe registrations (IBookRepository → SqliteBookRepository). This is where we show IoC in practice.
- `src/db/sqlite.ts` — opens the SQLite DB, initializes the `books` table, and exports the DB instance for repository use.
- `src/models/Book.ts` — Book type definition (id, title, author, publishedYear, createdAt, updatedAt).
- `src/repositories/IBookRepository.ts` — explicit interface for repository operations used by services.
- `src/repositories/SqliteBookRepository.ts` — SQL queries and row mapping to Book.
- `src/services/BookService.ts` — business rules, orchestrates repository operations.
- `src/controllers/BookController.ts` — zod schemas and handlers mapping HTTP ↔ service.
- `src/routes/bookRoutes.ts` — mounts controller handlers on REST endpoints.
- `src/middleware/errorHandler.ts` — maps domain errors / zod errors to HTTP responses.

---

## Technology stack

Runtime & language
- Node.js 24 (ESM)
- TypeScript

Frameworks & libraries
- express — web framework for routing and middleware
- better-sqlite3 — synchronous SQLite driver (no ORM)
- tsyringe — dependency injection container (constructor injection with decorators)
- reflect-metadata — required metadata polyfill for decorators
- zod — runtime data validation and parsing
- tsx (dev) — developer-friendly runner for TypeScript + ESM

Tooling
- tsc — TypeScript compiler

---

## Run steps

Prerequisites
- Node.js 24.x installed (the project targets Node 24+)
- npm available

Local development
1. Install dependencies
   ```bash
   npm install
   ```

2. Start in development mode (auto-reload)
   ```bash
   npm run dev
   ```
   - This runs `tsx watch src/server.ts` and restarts on file changes.

Build (production) and run
1. Build TypeScript into JavaScript (output to `dist/`)
   ```bash
   npm run build
   ```

2. Start the compiled server
   ```bash
   npm start
   ```

Type-check only
```bash
npm run typecheck
```

Notes
- No environment variables are used by design. SQLite file path and configuration live in `src/db/sqlite.ts` for clarity during teaching.
- The application ships with a simple schema initializer on startup — no migrations or external DB tools.

---

## API list

Base URL: http://localhost:3000 (default in server bootstrap)

Resources: /books

1. Create a book
   - Method: POST
   - Endpoint: /books
   - Request body (application/json):
     ```json
     {
       "title": "The Pragmatic Programmer",
       "author": "Andrew Hunt",
       "publishedYear": 1999
     }
     ```
   - Response: 201 Created
     ```json
     {
       "id": 1,
       "title": "The Pragmatic Programmer",
       "author": "Andrew Hunt",
       "publishedYear": 1999,
       "createdAt": "2026-07-08T12:00:00.000Z",
       "updatedAt": "2026-07-08T12:00:00.000Z"
     }
     ```
   - Validation: `title` and `author` are required strings; `publishedYear` is optional or required depending on controller schema (see code).

2. List all books
   - Method: GET
   - Endpoint: /books
   - Response: 200 OK
     ```json
     [
       { "...": "book objects" }
     ]
     ```

3. Get a book by id
   - Method: GET
   - Endpoint: /books/:id
   - Response: 200 OK
     ```json
     { "...": "book object" }
     ```
   - If not found: 404 Not Found (JSON error body)

4. Update a book
   - Method: PUT
   - Endpoint: /books/:id
   - Request body (application/json): partial or full object depending on controller (title, author, publishedYear)
   - Response: 200 OK — updated book object
   - If not found: 404 Not Found

5. Delete a book
   - Method: DELETE
   - Endpoint: /books/:id
   - Response: 204 No Content
   - If not found: 404 Not Found

Error format (JSON)
- Validation errors (zod) and domain errors are returned as JSON with an `error` or `errors` field. Example:
```json
{
  "error": "ValidationError",
  "details": [
    { "path": ["title"], "message": "Required" }
  ]
}
```
(Exact shape is implemented in the middleware; controllers and errors are translated consistently.)

---

## Learning objectives

By the end of the session, participants will be able to:
- Explain Clean Architecture and how the folder structure maps to architectural layers.
- Implement a repository interface and a concrete SQLite implementation without using an ORM.
- Write a service (use-case) class that depends on repository abstractions and encapsulates business rules.
- Use tsyringe to wire dependencies and demonstrate constructor injection and IoC.
- Validate incoming requests using zod at the controller boundary and separate validation from business logic.
- Structure an Express application with route modules, controllers, and centralized error handling.
- Discuss trade-offs: synchronous DB access (better-sqlite3) vs. async drivers, single-file DB initialization vs. migrations, and where to add configuration safely.

---

## Teaching & extension ideas

- Replace the synchronous repository with an async implementation and show how the service/controller boundaries remain unchanged.
- Add a second repository implementation (in-memory) and demonstrate swapping it via the DI container for testing or running in-memory demos.
- Introduce pagination, filtering, and basic validation rules (unique title constraint at service layer).
- Add request logging middleware and discuss cross-cutting concerns.

---

## Notes & conventions

- This project intentionally has:
  - No authentication or authorization.
  - No environment variables — configuration is explicit in code for clarity.
  - No Docker, no ESLint, no Prettier, and no tests — to keep focus on architecture and code clarity during the training session.
- Every file is small and heavily commented in the source to maximize teaching value.

---

If you want, I can now generate the next project file (one file at a time). Which file would you like next? Suggestions: `src/server.ts` (bootstrap), `src/container.ts` (DI bindings), or `src/db/sqlite.ts` (database connection and schema).