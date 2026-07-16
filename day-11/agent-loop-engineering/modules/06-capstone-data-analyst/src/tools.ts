// modules/06-capstone-data-analyst/src/tools.ts
//
// Generic tools that work with ANY CSV.
// Column names are normalized to lowercase so that:
//
// Price -> price
// PRICE -> price
// price -> price
//
// This allows the same agent to work with sales.csv,
// products.csv and future datasets.

import { readFileSync } from "node:fs";
import type { Tool } from "./types.ts";

export type Row = Record<string, string>;

let scratchpad: Row[] = [];

export function setScratchpad(rows: Row[]) {
  scratchpad = rows;
}

function rowsOrThrow(): Row[] {
  if (scratchpad.length === 0) {
    throw new Error("No rows loaded. Call loadCsv first.");
  }
  return scratchpad;
}

/*----------------------------------------------------------
  LOAD CSV
----------------------------------------------------------*/

export const loadCsv: Tool<
  { path: string },
  { rows: Row[]; columns: string[] }
> = {
  name: "loadCsv",

  description: "Load a CSV file into memory.",

  argsSchema: '{ "path": string }',

  run({ path }) {
    const raw = readFileSync(path, "utf8").trim();

    const [header, ...body] = raw.split(/\r?\n/);

    // Normalize every header
    const columns = header
      .split(",")
      .map((c) => c.trim().toLowerCase());

    const rows: Row[] = body.map((line) => {
      const cells = line.split(",");

      const row: Row = {};

      columns.forEach((column, index) => {
        row[column] = (cells[index] ?? "").trim();
      });

      return row;
    });

    return {
      rows,
      columns,
    };
  },
};

/*----------------------------------------------------------
  AGGREGATE
----------------------------------------------------------*/

export const aggregate: Tool<
  {
    column: string;
    op: "sum" | "avg" | "min" | "max" | "count";
  },
  number
> = {
  name: "aggregate",

  description:
    "Aggregate a numeric column (sum/avg/min/max/count).",

  argsSchema:
    '{ "column": string, "op":"sum"|"avg"|"min"|"max"|"count" }',

  run({ column, op }) {
    const rows = rowsOrThrow();

    if (op === "count") {
      return rows.length;
    }

    const col = column.toLowerCase();

    const nums = rows
      .map((row) => Number(row[col]))
      .filter((n) => !Number.isNaN(n));

    if (nums.length === 0) {
      return NaN;
    }

    switch (op) {
      case "sum":
        return nums.reduce((a, b) => a + b, 0);

      case "avg":
        return nums.reduce((a, b) => a + b, 0) / nums.length;

      case "min":
        return Math.min(...nums);

      case "max":
        return Math.max(...nums);

      default:
        return NaN;
    }
  },
};

/*----------------------------------------------------------
  GROUP BY
----------------------------------------------------------*/

export const groupBy: Tool<
  {
    groupColumn: string;
    valueColumn: string;
    op: "sum" | "avg" | "count";
  },
  Record<string, number>
> = {
  name: "groupBy",

  description:
    "Group rows by one column and aggregate another.",

  argsSchema:
    '{ "groupColumn": string, "valueColumn": string, "op":"sum"|"avg"|"count" }',

  run({ groupColumn, valueColumn, op }) {
    const rows = rowsOrThrow();

    const group = groupColumn.toLowerCase();

    const value = valueColumn.toLowerCase();

    const buckets: Record<string, number[]> = {};

    for (const row of rows) {
      const key = row[group];

      if (!key) continue;

      if (op === "count") {
        (buckets[key] ??= []).push(1);
        continue;
      }

      const num = Number(row[value]);

      if (Number.isNaN(num)) continue;

      (buckets[key] ??= []).push(num);
    }

    const result: Record<string, number> = {};

    for (const [key, values] of Object.entries(buckets)) {
      switch (op) {
        case "sum":
          result[key] = values.reduce((a, b) => a + b, 0);
          break;

        case "avg":
          result[key] =
            values.reduce((a, b) => a + b, 0) / values.length;
          break;

        case "count":
          result[key] = values.length;
          break;
      }
    }

    return result;
  },
};

/*----------------------------------------------------------
  CHART
----------------------------------------------------------*/

export const chart: Tool<
  {
    data: Record<string, number>;
    title?: string;
  },
  string
> = {
  name: "chart",

  description: "Render a simple ASCII bar chart.",

  argsSchema:
    '{ "data": Record<string,number>, "title"?: string }',

  run({ data, title }) {
    const entries = Object.entries(data).sort(
      (a, b) => b[1] - a[1]
    );

    if (entries.length === 0) {
      return `${title ?? "Chart"} : No data`;
    }

    const max = Math.max(...entries.map(([, v]) => v));

    const labelWidth = Math.max(
      ...entries.map(([k]) => k.length)
    );

    const chartWidth = 30;

    const lines: string[] = [];

    if (title) {
      lines.push(title);
    }

    for (const [label, value] of entries) {
      const bar = "#".repeat(
        Math.max(
          1,
          Math.round((value / max) * chartWidth)
        )
      );

      lines.push(
        `${label.padEnd(labelWidth)} | ${bar.padEnd(chartWidth)} ${value}`
      );
    }

    return lines.join("\n");
  },
};