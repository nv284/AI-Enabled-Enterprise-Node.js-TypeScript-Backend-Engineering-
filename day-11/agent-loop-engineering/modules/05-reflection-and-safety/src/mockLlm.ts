// modules/05-reflection-and-safety/src/mockLlm.ts
//
// The reasoner is now aware of two extra things:
//   1. observations may be { blocked: "..." } from a guard.
//   2. observations may be { error: "..." } from reflection or a thrown tool.
// In both cases it should adapt: retry with fixed args, or fall back.

import type { Decision, Reasoner, Step } from "./types.ts";

function isBlocked(obs: unknown): obs is { blocked: string } {
  return !!obs && typeof obs === "object" && "blocked" in (obs as object);
}
function isError(obs: unknown): obs is { error: string } {
  return !!obs && typeof obs === "object" && "error" in (obs as object);
}
function findGoodObs(history: Step[], toolName: string): unknown | undefined {
  return history.find(
    (s) => s.action.tool === toolName && !isBlocked(s.observation) && !isError(s.observation),
  )?.observation;
}
function includes(g: string, ...w: string[]): boolean {
  const s = g.toLowerCase();
  return w.every((x) => s.includes(x.toLowerCase()));
}

export interface MockOpts {
  /** Force the first CSV load to attempt a bad path to demo the guard. */
  demoBadPath?: boolean;
  /** Force the aggregation to target a non-numeric column to demo reflection. */
  demoBadColumn?: boolean;
}

export function makeMockLlm(opts: MockOpts = {}): Reasoner {
  return ({ goal, history }) => {
    // --- Recovery branches -------------------------------------------------
    const last = history[history.length - 1];
    if (last && (isBlocked(last.observation) || isError(last.observation))) {
      const failedTool = last.action.tool;

      if (failedTool === "loadCsv") {
        // Retry with the safe path.
        return {
          thought: "Previous load failed; retrying with the safe canonical path.",
          action: { tool: "loadCsv", args: { path: "data/sales.csv" } },
        };
      }
      if (failedTool === "aggregate") {
        // Fall back to counting rows.
        return {
          thought: "Aggregation returned NaN; falling back to count(rows).",
          action: { tool: "aggregate", args: { column: "revenue", op: "count" } },
        };
      }
      return final("Multiple attempts failed; aborting gracefully.");
    }

    // --- Normal branches ---------------------------------------------------
    const csv = findGoodObs(history, "loadCsv");
    if (!csv) {
      const path = opts.demoBadPath ? "data/../etc/passwd" : "data/sales.csv";
      return {
        thought: opts.demoBadPath
          ? "Trying an unsafe path on purpose -- guard should stop me."
          : "No data yet; load CSV.",
        action: { tool: "loadCsv", args: { path } },
      };
    }

    if (includes(goal, "total") && includes(goal, "revenue")) {
      const agg = findGoodObs(history, "aggregate");
      if (agg === undefined) {
        const column = opts.demoBadColumn ? "product" : "revenue";
        return {
          thought: opts.demoBadColumn
            ? "Deliberately summing a non-numeric column -- reflection should catch NaN."
            : "Aggregate sum(revenue).",
          action: { tool: "aggregate", args: { column, op: "sum" } },
        };
      }
      return final(`Result: ${agg}`);
    }

    return final("Loaded data but no rule matches this question.");
  };
}

function final(message: string): Decision {
  return { thought: "Done.", action: { tool: "final", args: { message } } };
}
