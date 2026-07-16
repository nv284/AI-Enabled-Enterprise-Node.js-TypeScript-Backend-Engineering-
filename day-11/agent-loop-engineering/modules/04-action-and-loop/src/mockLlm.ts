// modules/04-action-and-loop/src/mockLlm.ts
//
// Same shape as Module 03, extended with a small hint: when the reasoner
// asks for groupBy or aggregate, it assumes loadCsv has produced rows.

import type { Decision, Reasoner, Step } from "./types.ts";

function findObs(history: Step[], name: string): unknown | undefined {
  return history.find((s) => s.action.tool === name)?.observation;
}
function mentions(g: string, ...w: string[]): boolean {
  const s = g.toLowerCase();
  return w.every((x) => s.includes(x.toLowerCase()));
}

export const mockLlm: Reasoner = ({ goal, history }) => {
  const csv = findObs(history, "loadCsv") as { rows: unknown[] } | undefined;

  if (!csv) {
    return {
      thought: "No data yet -- load the CSV first.",
      action: { tool: "loadCsv", args: { path: "data/sales.csv" } },
    };
  }

  if (mentions(goal, "region") && mentions(goal, "revenue")) {
    const g = findObs(history, "groupBy");
    if (!g) {
      return {
        thought: "Revenue by region -> groupBy region, sum revenue.",
        action: {
          tool: "groupBy",
          args: { groupColumn: "region", valueColumn: "revenue", op: "sum" },
        },
      };
    }
    return final(`Revenue by region: ${JSON.stringify(g)}`);
  }

  if (mentions(goal, "total") && mentions(goal, "revenue")) {
    const t = findObs(history, "aggregate");
    if (t === undefined) {
      return {
        thought: "Total revenue -> aggregate sum(revenue).",
        action: { tool: "aggregate", args: { column: "revenue", op: "sum" } },
      };
    }
    return final(`Total revenue: ${t}`);
  }

  return final("Data loaded, but I don't have a rule for this question yet.");
};

function final(message: string): Decision {
  return { thought: "Enough info -- respond.", action: { tool: "final", args: { message } } };
}
