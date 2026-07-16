# Module 04 — Action & The Loop

**Time:** ~25 minutes
**Goal:** close the cycle. Wire reasoner + tools into a real loop, run it end-to-end, and see the full trace.

---

## Learning objectives

1. Implement a generic agent loop in ~40 lines.
2. Read an execution **trace** and explain what happened at each turn.
3. Understand two loop bugs before we fix them in Module 05: infinite loops, and no-error-handling.

---

## 1. The loop, drawn

```mermaid
flowchart TB
    Start([goal]) --> S[state = { goal, history: [] }]
    S --> Decide[decision = reasoner(state)]
    Decide --> Final{action.tool == 'final'?}
    Final -- yes --> Out([return message])
    Final -- no --> Run[observation = tools[action.tool].run(action.args)]
    Run --> Push[state.history.push({thought, action, observation})]
    Push --> Decide
```

That's it. Everything you have read about agents — planners, memories, ReAct, chain-of-thought, autonomous execution — is either **inside `reasoner`** or **inside `tools`**. The loop itself is trivial.

The three job of the loop:

1. **Dispatch.** Look up the tool by name; call `run(args)`.
2. **Accumulate.** Grow the history so the next reasoner call has full context.
3. **Exit.** Stop on `tool: "final"`, on error, or on max iterations.

---

## 2. The code

Read [src/loop.ts](src/loop.ts) — this is the heart of the course. Note:

- It is fully **generic**. It has no idea what "csv" or "region" means.
- It stops on **`tool === "final"`**, on **unknown tools**, and after **maxIterations** (default 8).
- It logs a **trace** to the console. Traces are the #1 debugging tool for real agents.

Then run:

```powershell
npm run m4
```

Expected trace (abridged):

```
[turn 1] thought: No data yet -- load the CSV first.
         action: loadCsv({"path":"data/sales.csv"})
         observation: { rows: 24, columns: [date, region, product, units, revenue] }

[turn 2] thought: Revenue by region -> groupBy region, sum revenue.
         action: groupBy({"groupColumn":"region","valueColumn":"revenue","op":"sum"})
         observation: {"North":1440,"South":1550,"East":2830}

[turn 3] thought: Enough info -- respond.
         action: final({"message":"Revenue by region: {...}"})

FINAL: Revenue by region: {"North":1440,"South":1550,"East":2830}
```

---

## 3. Trace anatomy

Every turn logs three things, in this order:

| Field | Comes from | Why it matters |
|---|---|---|
| `thought` | reasoner | The *why*. Reviewable by humans. |
| `action` | reasoner | The *what*. Machine-executable. |
| `observation` | tool | The *result*. Feeds the next turn. |

A production agent stores this trace to a database. When something goes wrong at 3am, the trace is the black-box recorder.

---

## 4. Two bugs already present

Play with the code and confirm you can trigger these:

### Bug A — silent infinite intent
Change the goal to `"how many rows are there?"`. There is no rule for that. Look at what happens:

- Turn 1: reasoner asks for `loadCsv`. Good.
- Turn 2: reasoner has no rule → returns a `final` with a "don't know" message.

OK, we're safe here — but only by accident. Ask yourself: **what if the reasoner had returned `loadCsv` again on turn 2?** The loop would call `loadCsv` forever until `maxIterations`. That's why the max-iterations guard exists.

### Bug B — a tool throws
Change the `path` argument in `mockLlm` to `"data/does-not-exist.csv"`. Run. The whole process crashes with an unhandled exception. That is not acceptable for an agent — one bad tool call should not kill the loop; the reasoner should get a chance to **reflect** and try something else.

We fix both properly in **Module 05**.

---

## 5. Try it (learner prompts)

1. Add a `console.log(state.history.length)` inside the loop. Confirm history grows exactly one step per turn.
2. Set `maxIterations: 2` and run the group-by question. What happens? What does the caller see?
3. **Prompt for your AI assistant:**

   > "In an agent loop, what's the difference between a stopping *condition* and a stopping *policy*? Give one example of each from real production systems."

---

## 6. Recap

- The loop is ~40 lines and never grows.
- All complexity lives in the reasoner and the tools.
- Traces are non-negotiable — build them from day one.
- Naïve loops have real failure modes; Module 05 hardens them.

Next: **[Module 05 — Reflection & Safety](../05-reflection-and-safety/README.md)**.
