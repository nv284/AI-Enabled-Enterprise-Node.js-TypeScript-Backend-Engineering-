// modules/03-reasoning/src/mockLlm.ts
//
// A deterministic stand-in for an LLM. Its ONLY job: given the current state,
// return a JSON-shaped Decision. It never runs tools.
//
// A real LLM would sit in this exact slot, taking the same input and
// producing the same output shape.

import type { Decision, Reasoner, Step } from "./types.ts";

/** Utility: has a tool with this name already produced a result? */
function findObservation(history: Step[], toolName: string): unknown | undefined {
  const step = history.find((s) => s.action.tool === toolName);
  return step?.observation;
}

/** Utility: does the goal string mention all of these keywords (case-insensitive)? */
function mentions(goal: string, ...words: string[]): boolean {
  const g = goal.toLowerCase();
  return words.every((w) => g.includes(w.toLowerCase()));
}

export const mockLlm: Reasoner = (state) => {
  const { goal, history } = state;

  // Rule 1: if we haven't loaded the CSV yet, that's always the first step.
  const csv = findObservation(history, "loadCsv") as
    | { rows: unknown[]; columns: string[] }
    | undefined;

  if (!csv) {
    return {
      thought: "I have no data yet. I should load the CSV first.",
      action: { tool: "loadCsv", args: { path: "data/sales.csv" } },
    };
  }

  // Rule 2: group-by-region questions.
  if (mentions(goal, "region") && mentions(goal, "revenue")) {
    const grouped = findObservation(history, "groupBy");
    if (!grouped) {
      return {
        thought: "Goal asks for revenue by region -> group by region, sum revenue.",
        action: {
          tool: "groupBy",
          args: { groupColumn: "region", valueColumn: "revenue", op: "sum" },
        },
      };
    }
    return finalAnswer(`Revenue by region: ${JSON.stringify(grouped)}`);
  }

  // Rule 3: total-revenue questions.
  if (mentions(goal, "total") && mentions(goal, "revenue")) {
    const total = findObservation(history, "aggregate");
    if (total === undefined) {
      return {
        thought: "Goal asks for total revenue -> aggregate sum(revenue).",
        action: { tool: "aggregate", args: { column: "revenue", op: "sum" } },
      };
    }
    return finalAnswer(`Total revenue: ${total}`);
  }

  // Rule 4: fallback.
  return finalAnswer(
    "I loaded the data but I don't have a rule to answer this question yet.",
  );
};

function finalAnswer(message: string): Decision {
  return {
    thought: "I have enough information; time to reply.",
    action: { tool: "final", args: { message } },
  };
}
