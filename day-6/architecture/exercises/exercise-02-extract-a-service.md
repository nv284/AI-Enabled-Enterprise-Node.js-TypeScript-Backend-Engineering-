# Exercise 2 — Extract a Service

**After:** Module 5. **Time:** 45 minutes.

## Goal

Convert a bad `Review` feature into a properly-extracted service. No repository yet — that's the next exercise.

## Starter code (paste into a scratch project or edit v2)

```ts
// src/reviews.ts
import express from 'express';
import Database from 'better-sqlite3';

const app = express();
app.use(express.json());
const db = new Database('bookstore.db');

db.exec(`CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL,
  customer_id INTEGER NOT NULL,
  rating INTEGER NOT NULL,
  body TEXT
);`);

app.post('/reviews', (req, res) => {
  const { bookId, customerId, rating, body } = req.body;
  if (!bookId || !customerId) return res.status(400).json({ error: 'missing ids' });
  if (rating < 1 || rating > 5) return res.status(400).json({ error: 'rating 1..5' });

  // Rule: a customer can only review a book they've ordered.
  const bought = (db.prepare(
    'SELECT COUNT(*) AS c FROM orders WHERE customer_id = ? AND book_id = ?'
  ).get(customerId, bookId) as any).c;
  if (bought === 0) return res.status(403).json({ error: 'you did not buy this book' });

  // Rule: only one review per (customer, book).
  const existing = db.prepare(
    'SELECT id FROM reviews WHERE customer_id = ? AND book_id = ?'
  ).get(customerId, bookId);
  if (existing) return res.status(409).json({ error: 'already reviewed' });

  const info = db.prepare(
    'INSERT INTO reviews (book_id, customer_id, rating, body) VALUES (?, ?, ?, ?)'
  ).run(bookId, customerId, rating, body ?? '');

  res.status(201).json({ id: info.lastInsertRowid });
});

app.listen(3000);
```

## Deliverables

1. `src/domain/errors.ts` — add `NotPurchasedError`, `AlreadyReviewedError`, `ValidationError`.
2. `src/services/ReviewService.ts` — one class, one method `submit(input)`. Takes `Database` in constructor (interfaces come in Exercise 3).
3. `src/index.ts` — thin controller that calls the service and maps errors via one middleware.
4. Verify: `grep -r "SELECT\|INSERT" src/services/` returns **one** file only (the service — SQL removed in the next exercise).

## Acceptance checklist

- [ ] Controller is < 10 lines.
- [ ] Service method name is a **business verb** (`submit`).
- [ ] Service throws typed errors — no `res.status` inside the service.
- [ ] Validation lives at the top of the service method.
- [ ] Error middleware maps each error type to a single HTTP code.
- [ ] The word `express` does not appear in `ReviewService.ts`.

## Stretch

Add a **second** method `deleteByCustomer(customerId, reviewId)` with the rule "*only the author can delete*". Keep the class cohesive.

## AI prompt to check your work

Use **Prompt 2** from [../prompts/README.md](../prompts/README.md) — paste your `ReviewService.ts`. Expect ≤ 1 smell.
