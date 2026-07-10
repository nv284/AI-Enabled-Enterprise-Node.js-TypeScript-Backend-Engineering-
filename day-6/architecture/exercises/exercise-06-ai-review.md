# Exercise 6 — AI-Review a Stranger's Code

**After:** Module 8. **Time:** 45 minutes.

## Goal

Practice using an AI reviewer as an audit tool — including catching AI mistakes.

## Setup

Find (or write) a **~200-line** Express + TypeScript file that mixes concerns. Options:

- Ask a peer to give you a rough MVP of a feature they wrote.
- Search GitHub for `"express" "better-sqlite3" language:typescript`, pick a small file.
- Regenerate v1 for a new feature (e.g. wishlist) and hand it in as "stranger's code".

## Part A — AI review pass (15 min)

1. In your AI chat, first paste **Prompt 7** (the "standards" system prompt from [../prompts/README.md](../prompts/README.md)).
2. Then paste the code with **Prompt 1** (layer scan).
3. Then paste it again with **Prompt 2** (service smells).
4. Save the AI's findings verbatim to `exercise-06-ai-review.md`.

## Part B — Verify each finding (20 min)

For every AI claim, mark it:

- ✅ **Real** — the line exists, the smell is real.
- ⚠️ **Real but overstated** — technically true, but not urgent.
- ❌ **Hallucinated** — line doesn't exist or claim is wrong.
- 🤔 **Style opinion** — not a rule; ignore.

Count how many fall in each bucket. Write the ratio at the top of your notes.

## Part C — Fix and re-review (10 min)

1. Fix the top 3 real findings.
2. Re-paste the whole file with **Prompt 1** and **Prompt 2**.
3. Compare: are the fixes reflected? Are there NEW findings the AI now surfaces?

## Acceptance checklist

- [ ] AI findings are stored verbatim.
- [ ] Every finding has a verification bucket.
- [ ] At least one hallucination or overstatement is identified.
- [ ] The re-review shows the 3 fixes as "OK".

## Reflection

Answer in 3–5 sentences:

- Which prompt (1 or 2) surfaced more real findings?
- What's one *category* of issue the AI missed that a human would catch?
- If you had to explain the value of AI review to a skeptical senior in one sentence, what would you say?
