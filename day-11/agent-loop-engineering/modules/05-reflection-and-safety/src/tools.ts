// modules/05-reflection-and-safety/src/tools.ts
// Same three tools as Module 04.

import { readFileSync } from "node:fs";
import type { Tool } from "./types.ts";

export type Row = Record<string, string>;

let scratchpad: Row[] = [];
export function setScratchpad(rows: Row[]) { scratchpad = rows; }
function rowsOrThrow(): Row[] {
  if (scratchpad.length === 0) throw new Error("no rows loaded -- call loadCsv first");
  return scratchpad;
}

export const loadCsv: Tool<{ path: string }, { rows: Row[]; columns: string[] }> = {
  name: "loadCsv",
  description: "Load a CSV file into rows.",
  argsSchema: '{ "path": string }',
  run({ path }) {
    const raw = readFileSync(path, "utf8").trim();
    const [header, ...body] = raw.split(/\r?\n/);
    const columns = header.split(",");
    const rows = body.map((line) => {
      const cells = line.split(",");
      const row: Row = {};
      columns.forEach((c, i) => (row[c] = cells[i] ?? ""));
      return row;
    });
    return { rows, columns };
  },
};

export const aggregate: Tool<
  { column: string; op: "sum" | "avg" | "min" | "max" | "count" },
  number
> = {
  name: "aggregate",
  description: "Reduce a column across all rows.",
  argsSchema: '{ "column": string, "op": "sum"|"avg"|"min"|"max"|"count" }',
  run({ column, op }) {
    const rows = rowsOrThrow();
    if (op === "count") return rows.length;
    const nums = rows.map((r) => Number(r[column])).filter((n) => !Number.isNaN(n));
    if (nums.length === 0) return NaN;
    switch (op) {
      case "sum": return nums.reduce((a, b) => a + b, 0);
      case "avg": return nums.reduce((a, b) => a + b, 0) / nums.length;
      case "min": return Math.min(...nums);
      case "max": return Math.max(...nums);
    }
  },
};
