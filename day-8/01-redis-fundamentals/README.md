# Module 01 — Redis Fundamentals in TypeScript

**Duration:** 45 minutes
**Prereq:** Module 00 complete (Redis running, `PONG` verified).
**Goal:** Know the 6 Redis data types you'll actually use, and know when to reach for each.

---

## 1.1 Why Redis?

Redis is a **single-threaded, in-memory data store** that answers most commands in **under 1 ms**.
Every command is **atomic** — no race conditions inside a single command.

```mermaid
flowchart LR
    subgraph "Traditional stack"
        A1[App] --> DB[(SQL DB<br/>~5–50 ms)]
    end
    subgraph "With Redis in front"
        A2[App] --> R[(Redis<br/>~0.1–1 ms)]
        R -. miss .-> DB2[(SQL DB)]
    end
```

Rule of thumb: **Redis is 10× – 100× faster than a SQL round-trip.** That's the whole game.

---

## 1.2 The mental model — six types, one job each

```mermaid
mindmap
  root((Redis types))
    Strings
      counters
      cached JSON
      locks (SET NX)
    Hashes
      one record
      per-field counters
    Lists
      queues
      recent-N
    Sets
      tags
      unique-of-X
    Sorted Sets
      leaderboards
      rate limiting
      time windows
    TTL
      auto-expire
      no cron
```

| Type      | TypeScript analogy                | Killer use case                     |
|-----------|-----------------------------------|-------------------------------------|
| String    | `string` (also int, bytes)        | Cached JSON, counters, tokens       |
| Hash      | `Record<string,string>`           | One user / product / session record |
| List      | Doubly-linked `Array<string>`     | Queues, "last 10 searches"          |
| Set       | `Set<string>`                     | Tags, unique visitors               |
| Sorted set| `Map<string, number>` + sort      | Leaderboards, sliding windows       |
| TTL       | (a modifier, not a type)          | Auto-expire anything                |

---

## 1.3 Install the module code

```powershell
cd 01-redis-fundamentals
npm install
```

If you're on Redis Cloud instead of Docker, set the URL for this shell:

```powershell
$env:REDIS_URL="redis://default:YOUR_PASSWORD@YOUR_HOST:YOUR_PORT"
```

---

## 1.4 Walk-through — run one demo at a time

Do these **in order** — each script is short and prints what it does.

```powershell
npm run strings     # SET, GET, SETEX, INCR, MSET/MGET, SET NX (locks)
npm run hashes      # HSET, HGETALL, HINCRBY
npm run lists       # LPUSH + LTRIM (capped list), RPOP as a queue
npm run sets        # SADD, SINTER, SISMEMBER
npm run zsets       # ZADD, ZREVRANGE, ZINCRBY, sliding-window preview
npm run ttl         # EXPIRE, SET EX, PERSIST, live expiry watch
npm run pipeline    # naive vs pipelined — big timing difference
```

After each run, open `src/<name>.ts` and read the code you just executed.

### Teaching moments (trainer says these out loud)

- After **strings** — "`SET NX EX` is how you build a poor-man's distributed lock in one line."
- After **hashes** — "Don't `JSON.parse` a user object 100 times a second. Store fields in a hash and read one at a time."
- After **lists** — "`LPUSH` + `LTRIM` = a bounded 'recent N' with zero cleanup code."
- After **zsets** — "Every rate limiter and every leaderboard in your career will use this."
- After **ttl** — "TTL is Redis's built-in cron. Never write a `deleteExpiredRows` job again."
- After **pipeline** — "Round-trips, not commands, are your bottleneck. Batch."

---

## 1.5 Key naming — the one convention that saves you

```
<domain>:<id>:<attribute>
user:42:name
product:1:cache
session:abc123
```

- Use `:` as a separator (Redis GUIs group by it).
- Put the **variable part in the middle** (id), not the end.
- Never use raw user input as a key — always prefix.

```mermaid
flowchart LR
    K["cart:USER_42:items"] --> D1[domain: cart]
    K --> D2[id: USER_42]
    K --> D3[attribute: items]
```

---

## 1.6 Exercises (25 min)

Do all three. **Type the code**, don't paste.

### Exercise 1.6.1 — Page-view counter

Create `exercises/pageviews.ts`.

Requirements:

1. Every call to `record(path)` bumps `pageviews:<path>` by 1.
2. `top(n)` returns the top-`n` paths by view count (hint: also `ZINCRBY "pageviews:_index" 1 <path>` on every record — a sorted set doubles as an index).
3. Print the top 3 after recording:
   - `/home` × 5, `/about` × 1, `/pricing` × 3, `/blog` × 8.

Expected output:

```
1. /blog   -> 8
2. /home   -> 5
3. /pricing -> 3
```

### Exercise 1.6.2 — OTP with TTL

Create `exercises/otp.ts`.

1. `generate(phone)` picks a random 6-digit code, stores it at `otp:<phone>` with **60-second TTL**, and returns the code.
2. `verify(phone, code)` returns `"ok"`, `"wrong"`, or `"expired"`.
3. After verifying `"ok"`, **delete the key** so it can't be reused.

Test all three paths.

### Exercise 1.6.3 — Recent 5 searches per user

Create `exercises/recent.ts`.

Given user `"u1"`, a call to `search("u1", "redis")` should:

1. Push `"redis"` to the head of `recent:u1`.
2. Trim so only the newest 5 remain.
3. If the term is already in the list, **remove old occurrences first** (hint: `LREM key 0 value`).

Push 8 different terms plus one repeat, then print the list.

---

## 1.7 Activity — key-design speed round (5 min)

Trainer calls out a scenario, participants shout back a **key pattern + Redis type**. Sample scenarios:

| Scenario                                            | One good answer                                |
|-----------------------------------------------------|------------------------------------------------|
| Store a user's shopping cart                        | Hash `cart:<userId>`                           |
| Count unique visitors to a page today               | Set `visitors:<page>:<yyyy-mm-dd>`             |
| Leaderboard for a game season                       | Zset `leaderboard:season-2026`                 |
| Cache the JSON of `GET /products/42`                | String `cache:product:42` with 5-min TTL       |
| Queue of pending emails                             | List `queue:email` (RPUSH + LPOP)              |
| "You have 3 unread notifications" badge             | String counter `notif:<userId>:unread` (INCR)  |
| Idempotency: don't process the same webhook twice   | String `webhook:<id>` with `SET NX EX 3600`    |

---

## 1.8 AI reflection prompt

Paste into ChatGPT / Claude, save the answer in `notes.md`:

> "I just learned Redis strings, hashes, lists, sets, sorted sets, TTL, and pipelines using `ioredis` in TypeScript. Give me a short 'when NOT to use each' list — 1 line per type — that I can pin above my desk. Then propose 3 real-world features from a URL shortener (like bit.ly) where I'd use a sorted set and explain why."

Keep the answer — Module 06 (capstone) will reuse some of these ideas.

---

## Done? ✅

- All 7 scripts run without errors.
- Three exercises produce expected output.
- You could, without notes, pick a Redis type for a random real-world feature.

➡ Next: [../02-caching-strategies/README.md](../02-caching-strategies/README.md)
