# Prompt Library — Cache & Performance Reviews

Copy-paste ready. Fill in the `{{placeholders}}`.

---

## P1 — Endpoint classification

```
Here is my endpoint code and its traffic profile:

```ts
{{PASTE_CODE}}
```

Traffic: {{READS_PER_MIN}} reads/min, {{WRITES_PER_MIN}} writes/min.
Response shape: JSON, ~{{SIZE_KB}} KB.
Freshness tolerance: {{FRESHNESS_SECONDS}} seconds.

Classify this endpoint as read-heavy / write-heavy / mixed / real-time.
Justify in one sentence.
```

---

## P2 — Cache key + TTL

```
For the endpoint above, assuming Redis is available, recommend:

1. Cache key pattern (give the exact string, using variable names).
2. Value shape — raw JSON / Redis hash / compressed?
3. TTL in seconds, with a small random jitter range (state min & max).
4. Invalidation trigger — which write(s) invalidate which key(s)?
5. One failure mode this cache does NOT protect against.

Reply as a 5-row markdown table. Be specific — no "depends on your case".
```

---

## P3 — Bottleneck identification

```
Autocannon report at concurrency {{N}}, duration {{D}}s:

```
{{PASTE_AUTOCANNON_OUTPUT}}
```

Endpoint code:

```ts
{{PASTE_CODE}}
```

Rank the top 3 bottlenecks by expected impact. For each:
- Exact line number(s) in the pasted code
- Anti-pattern name (from the standard list: N+1, event-loop block, missing cache, thundering herd, no pagination, oversized payload, sync CPU, unbounded resource)
- Smallest possible fix (1–3 lines of TypeScript)
- How to verify the fix worked (one sentence)
```

---

## P4 — Rate-limit recommendation

```
Recommend a rate limit for this endpoint:

- Users: {{AUTHENTICATED / ANON / MIXED}}
- Business tiers: {{FREE, PRO, ENTERPRISE, N/A}}
- Threat model: {{brute force / scraping / cost control / abuse}}
- Downstream cost per request: {{cheap DB / paid API / LLM call}}

Give me:
1. Algorithm — fixed window / sliding window / token bucket. Justify.
2. Points and duration.
3. Key (what to bucket by).
4. Exact response body + headers on 429.
5. One edge case I should write a test for.
```

---

## P5 — Verification checklist

```
Before I ship the changes above, list 5 things I should monitor in production
to catch regressions. Cover:
- Cache hit ratio (how to compute it)
- p99 latency
- 429 rate
- Redis memory + eviction rate
- One "silent failure" signal I'd otherwise miss (e.g. cache stampede, stale-forever key)

For each, name the metric, a threshold that should page me, and where to look
(logs, Prometheus, Redis INFO, etc.).
```

---

## P6 — "Grade my fix" prompt (use AFTER you code)

```
I applied this change to fix {{PROBLEM}}:

```diff
{{PASTE_DIFF}}
```

Before → after autocannon numbers:
{{BEFORE}}
{{AFTER}}

1. Did the change actually address the root cause? (yes / partly / no + why)
2. What new failure mode did this change introduce, if any?
3. One follow-up improvement to consider next iteration.
```

---

## P7 — Design review for a new endpoint

```
I'm about to design an endpoint with these requirements:

- Method + path: {{METHOD PATH}}
- What it does: {{PURPOSE}}
- Expected traffic: {{RPS}}
- Data source: {{DB / API / mix}}
- Auth: {{yes/no; tiers}}

Sketch:
1. Redis key pattern(s)
2. TTL strategy
3. Rate-limit config
4. What to log / metric
5. The single biggest thing I could get wrong

Keep it to under 10 bullet points.
```

---

## P8 — Compare two approaches

```
Given the endpoint described above, compare these two implementations
for read-heavy production traffic (~1000 RPS):

Approach A:
```ts
{{PASTE_A}}
```

Approach B:
```ts
{{PASTE_B}}
```

For each, list: expected p99, Redis load, failure modes, and one operational
concern (deploys, memory, cold starts). Then say which you'd ship and why.
```

---

## Tips for using these prompts

- **Attach the file** in Copilot Chat instead of pasting when you can — cheaper on tokens, less error-prone.
- **Ask one question at a time.** Do NOT paste all 5 prompts as one megablock.
- **Save every answer** in a `review.md` per endpoint. Weeks later you'll thank yourself.
- **Cite the AI in your PR description** ("Cache TTL of 60s recommended by Copilot after profiling; validated with 4.7× RPS improvement on autocannon"). Reviewers value the reasoning.
