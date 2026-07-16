// modules/02-perception-and-tools/src/run.ts
//
// Smoke-test the tool by hand. There is still no "agent" here -- we are
// playing the role of the reasoner ourselves by calling loadCsv directly.
// Module 03 replaces THIS file with a decision-maker.

import { loadCsv } from "./tools/loadCsv.ts";
import { renderCatalog } from "./tool.ts";

const registry = { [loadCsv.name]: loadCsv };

console.log("Tool catalog the reasoner would see:\n");
console.log(renderCatalog(registry));
console.log("\n--- calling loadCsv by hand ---\n");

const result = loadCsv.run({ path: "data/sales.csv" });

console.log(`${result.rows.length} rows loaded. First row:`);
console.log(result.rows[0]);
console.log("\nColumns:", result.columns.join(", "));
