# Trainer Cheat Sheet

Quick reference to keep the day on rails.

## Timing (adjust ±10 min per group)

| Slot          | Module                                          | Watch for                                |
|---------------|-------------------------------------------------|------------------------------------------|
| 09:00 – 09:30 | 00 – Setup                                      | Docker Desktop not started on Windows    |
| 09:30 – 10:15 | 01 – Redis fundamentals                         | Confusing `LPUSH` order for freshers     |
| 10:30 – 11:45 | 02 – Caching strategies                         | Cache-aside vs write-through confusion   |
| 11:45 – 12:30 | 03 – Rate limiting                              | `req.ip` returning `::1` (IPv6 localhost)|
| 13:30 – 14:30 | 04 – Profiling with AI                          | `clinic` install fails behind proxies    |
| 14:30 – 15:15 | 05 – AI review workflow                         | Freshers copy code without context       |
| 15:30 – 17:30 | 06 – Capstone                                   | `/:code` route order shadowing           |

## Common blockers & fixes

| Symptom                                             | Fix                                                         |
|-----------------------------------------------------|-------------------------------------------------------------|
| `EADDRINUSE :3002/3003/3004/3006`                   | Another module still running — kill node in Task Manager   |
| `ECONNREFUSED 127.0.0.1:6379`                       | Docker Redis not up: `docker start redis-training`         |
| `redis-cli` in container returns nothing            | Missing `-it`: `docker exec -it redis-training redis-cli`  |
| `req.ip` is `::1` and rate limit shared             | Trust proxy is on; that's IPv6 localhost — fine locally     |
| `clinic doctor` won't start                         | `npm i -g clinic` first; needs global on some setups        |
| `nanoid` v4+ ESM error                              | We pin `nanoid@^3.3.7` (CJS) — check package.json           |
| PowerShell `$env:REDIS_URL="..."` doesn't persist   | Only for that shell; open a new tab and it's gone           |

## Talking points per module

- **01 – strings** — "SET NX is a lock in one line." Draw two workers racing.
- **01 – zsets** — "This is the type you'll use most. Rate limiters + leaderboards + windows."
- **02** — Ask: "If you write to DB and then the cache set fails, what should happen?" (Correct answer: cache-aside doesn't care — the next read repopulates. Write-through must retry or rollback.)
- **03** — Draw the boundary-burst gantt chart on the whiteboard. Fixed vs sliding is easy to get if seen visually.
- **04** — Emphasise: "Measure. Change one thing. Measure again."
- **05** — The single biggest lesson: **"AI is fastest as a reviewer, not a coder."**
- **06** — Ask everyone to look at `server.ts` and predict what breaks if `/:code` route is registered before `/analytics/:code`. (Answer: `analytics` matches `:code` so it becomes "the analytics code".)

## Grading rubric (for capstone show-and-tell)

Give each participant a 1–5 rating on:

- Correctness — endpoints work, redirects redirect, analytics increment.
- Cache hygiene — TTLs set, invalidation on delete.
- Rate limits — return 429 with correct headers.
- Observation — `AI-REVIEW.md` cites specific load numbers.
- Explanation — can defend one design choice (e.g. "why negative cache 30 s?").

Anyone at ≥ 4 in all five: promote to running the next in-house session on this topic.

## Post-training follow-ups (optional homework)

1. Swap the in-memory `Map` for SQLite via `better-sqlite3`.
2. Add stampede protection with `SET NX EX` mutex.
3. Add Prometheus metrics: `cache_hits_total`, `cache_misses_total`, `rate_limit_blocks_total`.
4. Deploy to Fly.io / Railway / any free tier and hit it with autocannon from your laptop.
