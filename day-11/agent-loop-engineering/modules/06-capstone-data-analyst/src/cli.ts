// modules/06-capstone-data-analyst/src/cli.ts
//
// CLI entry point. Grab the question from argv, run the agent, print the answer.
//
// Usage:
//   npx tsx modules/06-capstone-data-analyst/src/cli.ts "chart revenue by region"

import { runAgent } from "./agent.ts";
import { mockLlm } from "./mockLlm.ts";
import { aggregate, chart, groupBy, loadCsv } from "./tools.ts";

const goal = process.argv.slice(2).join(" ").trim();
if (!goal) {
  console.error(
    'Usage: tsx cli.ts "<your question>"\n' +
      'Try: "what is the total revenue?" | "chart revenue by region" | "average units per sale?"',
  );
  process.exit(1);
}

const { finalMessage, history } = await runAgent({
  goal,
  reasoner: mockLlm,
  tools: { loadCsv, aggregate, groupBy, chart },
});

console.log("\n" + "=".repeat(60));
console.log(`FINAL: ${finalMessage}`);
console.log("=".repeat(60));
console.log(`(${history.length} turns, ${history.length ? "trace above" : "no tool calls"})`);
