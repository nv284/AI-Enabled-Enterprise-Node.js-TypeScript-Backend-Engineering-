// modules/04-action-and-loop/src/tools.ts
//
// Three tools the reasoner can call: loadCsv, aggregate, groupBy.
// All values in CSV are strings; the numeric tools coerce with Number().

import { readFileSync } from "node:fs";
import type { Tool } from "./types.ts";

export type Row = Record<string, string>;

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
  description: "Reduce a column across all rows currently in memory.",
  argsSchema: '{ "column": string, "op": "sum"|"avg"|"min"|"max"|"count" }',
  run({ column, op }) {
    const rows = getRowsFromScratchpad();
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

export const groupBy: Tool<
  { groupColumn: string; valueColumn: string; op: "sum" | "avg" | "count" },
  Record<string, number>
> = {
  name: "groupBy",
  description: "Group rows by a column and reduce a value column per group.",
  argsSchema: '{ "groupColumn": string, "valueColumn": string, "op": "sum"|"avg"|"count" }',
  run({ groupColumn, valueColumn, op }) {
    const rows = getRowsFromScratchpad();
    const buckets: Record<string, number[]> = {};
    for (const r of rows) {
      const key = r[groupColumn];
      const val = Number(r[valueColumn]);
      if (!Number.isNaN(val)) (buckets[key] ??= []).push(val);
    }
    const out: Record<string, number> = {};
    for (const [k, arr] of Object.entries(buckets)) {
      if (op === "count") out[k] = arr.length;
      else if (op === "sum") out[k] = arr.reduce((a, b) => a + b, 0);
      else out[k] = arr.reduce((a, b) => a + b, 0) / arr.length;
    }
    return out;
  },
};

// -----------------------------------------------------------------------------
// A crude "scratchpad" so aggregate/groupBy can see the rows loaded by loadCsv.
// A production agent would pass this via state; we keep it module-local to
// avoid distracting from the loop concept.
// -----------------------------------------------------------------------------
let scratchpad: Row[] = [];
export function setScratchpad(rows: Row[]) { scratchpad = rows; }
function getRowsFromScratchpad(): Row[] {
  if (scratchpad.length === 0) throw new Error("no rows loaded yet -- call loadCsv first");
  return scratchpad;
}
