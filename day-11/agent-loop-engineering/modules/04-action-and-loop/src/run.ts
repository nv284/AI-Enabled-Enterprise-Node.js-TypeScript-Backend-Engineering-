// modules/04-action-and-loop/src/run.ts
//
// End-to-end: user goal in, final answer out, full trace in between.

import { runLoop } from "./loop.ts";
import { mockLlm } from "./mockLlm.ts";
import { aggregate, groupBy, loadCsv } from "./tools.ts";

const goal = "what is the total revenue by region?";

const result = await runLoop({
  goal,
  reasoner: mockLlm,
  tools: { loadCsv, aggregate, groupBy },
  maxIterations: 8,
});

console.log(`\nFINAL: ${result.finalMessage}`);
console.log(`(${result.history.length} tool calls made)`);
