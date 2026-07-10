# GraphQL — Generic Prompts

---

## 1. Schema Preparation

> Design a GraphQL schema for a [domain] API. Include:
> - Core types with scalar fields and relationships between them.
> - Enum types for fields with a fixed set of values.
> - Input types for mutations and complex query arguments.
> - A connection/wrapper type for paginated list queries.
> - `Query` type with single-item and list fetching operations.
> - `Mutation` type with create, update, and delete operations.

---

## 2. Schema Review

> Review a GraphQL schema and identify issues in these areas:
> - Nullability — which fields should be non-null (`!`) and which should be optional?
> - Use of enums vs plain strings for constrained values.
> - Pagination — are list queries wrapped in a connection type?
> - Input types — are complex arguments using `input` types instead of inline scalar args?
> - Naming conventions — are types, fields, and arguments named consistently?
> - Missing or redundant types and fields.

---

## 3. N+1 Problem + Fix

> Explain the N+1 query problem in GraphQL and how to fix it.
> - What causes it when resolving a nested field on a list of parent objects?
> - Show a naive resolver that triggers N+1 (one data call per parent).
> - Fix it using **DataLoader**: batch all child IDs collected from the parent list into a
>   single data call, then map results back to each parent.
> - Provide a reusable DataLoader example in TypeScript.

---

## 4. Client Query (Nested) to Fix N+1 Problem

> Write a GraphQL query that fetches a list of items with nested related data. Structure it
> so the server can batch-resolve the nested field via DataLoader in a single call.
> - Use variables for pagination (`limit`, `offset`).
> - Request fields on both the parent type and the nested type.
> - Optionally include a reverse-nested field (e.g., parent → child → parent's other children)
>   to demonstrate multi-level DataLoader batching.

---

## 5. Filtering Nested Query

> Write a GraphQL query that filters a list using an `input` filter type and returns nested
> related data alongside the filtered results.
> - Use an `input` variable for all filter criteria (text search, enum, numeric range).
> - Add sorting and pagination arguments.
> - Include nested fields on each result item.
> - Provide example query variables that exercise each filter field.
