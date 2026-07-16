// modules/03-reasoning/src/run.ts
//
// Watch the reasoner in isolation. There is still no loop -- we just call
// mockLlm three times with a growing history to see how its decisions evolve.

import { mockLlm } from "./mockLlm.ts";
import type { Step } from "./types.ts";

const goal = "what is the total revenue by region?";
const catalog =
  "- loadCsv: load CSV\n- groupBy: group rows and reduce\n- aggregate: reduce a column\n- final: reply to user";

// Turn 1: no history yet.
let history: Step[] = [];
let d = mockLlm({ goal, history, catalog });
console.log("Turn 1 decision:", d);

// Simulate the loop running loadCsv and getting rows.
history = [
  {
    thought: d.thought,
    action: d.action,
    observation: { rows: new Array(24).fill({}), columns: ["date", "region", "revenue"] },
  },
];

// Turn 2: now the reasoner has data.
d = mockLlm({ goal, history, catalog });
console.log("\nTurn 2 decision:", d);

// Simulate groupBy having run.
history.push({
  thought: d.thought,
  action: d.action,
  observation: { North: 1240, South: 980, East: 1500 },
});

// Turn 3: now the reasoner should finalize.
d = mockLlm({ goal, history, catalog });
console.log("\nTurn 3 decision:", d);
