// modules/05-reflection-and-safety/src/run.ts
//
// Two demos back-to-back:
//   A. bad-path attempt -> guard blocks -> reasoner retries safely
//   B. bad-column aggregate -> NaN -> reflection catches -> reasoner falls back

import { runLoop } from "./loop.ts";
import { makeMockLlm } from "./mockLlm.ts";
import { aggregate, loadCsv } from "./tools.ts";

const tools = { loadCsv, aggregate };

console.log("=".repeat(60));
console.log("DEMO A -- path guard");
console.log("=".repeat(60));
const a = await runLoop({
  goal: "what is the total revenue?",
  reasoner: makeMockLlm({ demoBadPath: true }),
  tools,
});
console.log(`\nFINAL A: ${a.finalMessage}\n`);

console.log("=".repeat(60));
console.log("DEMO B -- reflection catches NaN");
console.log("=".repeat(60));
const b = await runLoop({
  goal: "what is the total revenue?",
  reasoner: makeMockLlm({ demoBadColumn: true }),
  tools,
});
console.log(`\nFINAL B: ${b.finalMessage}`);
