// modules/02-perception-and-tools/src/tools/loadCsv.ts
//
// The agent's first "sense": read a CSV file into row objects.
// Deliberately tiny -- no external CSV lib. Real code would use `papaparse`
// or `csv-parse`, but zero-dep keeps the focus on the loop.

import { readFileSync } from "node:fs";
import type { Tool } from "../tool.ts";
//import { Row } from "../../../04-action-and-loop/src/tools.ts";

export type Row = Record<string, string>;
export interface LoadCsvArgs {
  path: string;
}
export const dataset = {
  sales: "data/sales.csv",
  products: "data/products.csv"
}
export interface LoadCsvResult {
  rows: Row[];
  columns: string[];
}

export const loadCsv: Tool<LoadCsvArgs, LoadCsvResult> = {
  name: "loadCsv",
  description: "Load a CSV file into an array of row objects.",
  argsSchema: '{ "path": "relative path to a .csv file under ./data/" }',

  run({ path }) {
    const raw = readFileSync(path, "utf8").trim();
    const [header, ...body] = raw.split(/\r?\n/);
    const columns = header.split(",");
    const rows: Row[] = body.map((line) => {
      const cells = line.split(",");
      const row: Row = {};
      columns.forEach((c, i) => (row[c] = cells[i] ?? ""));
      return row;
    });
    return { rows, columns };
  },
};
/**export interface LoadCsvArgs {
  path: string;
}

export interface LoadCsvResult {
  rows: Row[];
  columns: string[];
}

export const loadCsv: Tool<LoadCsvArgs, LoadCsvResult> = {
  name: "loadCsv",
  description: "Load a CSV file into rows.",
  argsSchema: '{ "path": string }',

  run({ path }) {

    const raw = readFileSync(path, "utf8").trim();

    const [header, ...body] = raw.split(/\r?\n/);

    // Normalize headers
    const columns = header
      .split(",")
      .map(c => c.trim().toLowerCase());

    const rows = body.map(line => {

      const cells = line.split(",");

      const row: Row = {};

      columns.forEach((c, i) => {

        row[c] = (cells[i] ?? "").trim();

      });

      return row;

    });

    return {
      rows,
      columns
    };

  },

};**/