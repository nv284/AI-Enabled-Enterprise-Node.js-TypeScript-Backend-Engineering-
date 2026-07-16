# Module 03 — Reasoning (the Mock LLM)

**Time:** ~25 minutes
**Goal:** replace *you* as the decision-maker with a function that picks the next tool from the current state — the same shape a real LLM call would have.

---

## Learning objectives

1. Describe the **ReAct** pattern: *Thought → Action → Observation*, one step at a time.
2. Design a **decision function** whose input is state, whose output is a next-step action.
3. Understand what a real LLM call would look like in the same slot, and why the *interface* is what matters.

---

## 1. What "reasoning" is (and isn't)

Reasoning in an agent is not the model magically solving your problem in its head.
It is the model producing **one small structured decision at a time**:

> *"Given the goal and everything I've seen so far, the next tool to call is `X` with arguments `Y` — and here is my one-line thought about why."*

That is the **ReAct** pattern (Yao et al., 2022): interleave **Rea**soning and **Act**ing.

```mermaid
sequenceDiagram
    participant Loop
    participant Reasoner as Reasoner (LLM / mockLlm)
    participant Tools

    Loop->>Reasoner: state = { goal, history, catalog }
    Reasoner-->>Loop: { thought, action: { tool, args } }
    Loop->>Tools: run(tool, args)
    Tools-->>Loop: observation
    Loop->>Reasoner: state (now with new observation)
    Reasoner-->>Loop: { thought, action: { tool: "final", args: { message } } }
```

Key idea: the reasoner **does not run the tool**. It only *decides*. Execution is the loop's job (Module 04). This separation is what makes the system testable, safe, and swappable.

---

## 2. The decision contract

Everything in this course flows through this one type:

```ts
type Action =
  | { tool: string; args: Record<string, unknown> }
  | { tool: "final"; args: { message: string } };

interface Decision {
  thought: string;   // for logs + reflection
  action: Action;
}

type Reasoner = (state: {
  goal: string;
  history: Step[];       // past thought/action/observation triples
  catalog: string;       // rendered tool list
}) => Decision;
```

A **real** LLM slot in this exact place. Its job is to produce JSON that matches `Decision`. In production you would:

1. Build a prompt containing `goal + catalog + history`.
2. Ask the model to return JSON with keys `thought` and `action`.
3. Parse and validate.

Our `mockLlm()` does step 3 directly, deterministically, with rules. **The loop cannot tell the difference.**

---

## 3. Read the mock

Open [src/mockLlm.ts](src/mockLlm.ts). It is intentionally simple:

- If we have no CSV in history → decide `loadCsv`.
- Else if the goal mentions "region" and "revenue" → decide `groupBy` on `region` summing `revenue`.
- Else if the goal mentions "total revenue" → decide `aggregate` sum(revenue).
- Else if we already have a numeric result in history → decide `final` with a formatted answer.
- Else → decide `final` with a graceful "I don't know how to answer that yet."

Then run:

```powershell
npm run m3
```

You will see the reasoner make **three separate decisions** as we feed it a growing history — no loop yet, but you can watch its reasoning evolve.

---

## 4. Swapping in a real LLM (preview)

Here is what the same function would look like against OpenAI. Do **not** copy this into the project — we stay LLM-free. It is here so you can see the shape.

```ts
// PSEUDO -- for orientation only
export async function realLlm(state): Promise<Decision> {
  const prompt = `
You are an agent. Available tools:
${state.catalog}

Goal: ${state.goal}
History (JSON): ${JSON.stringify(state.history)}

Respond ONLY with JSON: { "thought": string, "action": { "tool": string, "args": object } }
Use tool "final" when the goal is answered.
`;
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [{ role: "user", content: prompt }],
  });
  return JSON.parse(res.choices[0].message.content!) as Decision;
}
```

Notice:

- **Same input, same output.** The loop doesn't change.
- **Prompt is derived from state.** Whoever engineers this prompt engineers the agent.
- **`response_format: json_object`** is the tiny detail that turns a chatbot into an agent primitive.

---

## 5. Try it (learner prompts)

1. Add a rule to `mockLlm` that answers *"how many rows are there?"* using a new `count` tool (you don't need to implement the tool yet — just the decision).
2. **Prompt for your AI assistant:**

   > "What could go wrong if the LLM returns invalid JSON? List three defensive strategies."

3. Edit `run.ts` to feed the reasoner a fake history where `loadCsv` returned zero rows. What action does it pick? Should it be different? (This is a bug! We fix it with **reflection** in Module 05.)

---

## 6. Recap

- Reasoning = a **pure function** from state to next action.
- ReAct = one step at a time, with an explicit `thought`.
- Real LLMs plug into this same slot; the rest of the system doesn't care.
- The mock is deterministic and dumb — perfect for teaching the loop shape.

Next: **[Module 04 — Action & The Loop](../04-action-and-loop/README.md)** — we finally close the cycle.
