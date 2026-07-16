// modules/05-reflection-and-safety/src/loop.ts
//
// The Module 04 loop with three additions:
//   1. Guards run before each tool call.
//   2. tool.run() is wrapped in try/catch.
//   3. reflect() inspects the observation; a bad reflection becomes an error obs.
//
// Failures never crash the loop -- they become observations the reasoner sees.

import type { Reasoner, Step, ToolRegistry } from "./types.ts";
import { setScratchpad, type Row } from "./tools.ts";
import { guardArgs, guardToolExists } from "./guards.ts";
import { reflect } from "./reflect.ts";

export interface LoopOptions {
  goal: string;
  reasoner: Reasoner;
  tools: ToolRegistry;
  maxIterations?: number;
}

export interface LoopResult {
  finalMessage: string;
  history: Step[];
}

export function renderCatalog(tools: ToolRegistry): string {
  return Object.values(tools)
    .map((t) => `- ${t.name}: ${t.description}\n  args: ${t.argsSchema}`)
    .join("\n");
}

export async function runLoop(opts: LoopOptions): Promise<LoopResult> {
  const { goal, reasoner, tools, maxIterations = 8 } = opts;
  const history: Step[] = [];
  const catalog = renderCatalog(tools);

  for (let turn = 1; turn <= maxIterations; turn++) {
    const { thought, action } = reasoner({ goal, history, catalog });
    console.log(`\n[turn ${turn}] thought: ${thought}`);
    console.log(`         action: ${action.tool}(${JSON.stringify(action.args)})`);

    if (action.tool === "final") {
      return { finalMessage: (action.args as { message: string }).message, history };
    }

    // --- GUARDS ------------------------------------------------------------
    const gExists = guardToolExists(action.tool, tools);
    if (!gExists.ok) {
      history.push({ thought, action, observation: { blocked: gExists.reason } });
      console.log(`         BLOCKED: ${gExists.reason}`);
      continue;
    }
    const gArgs = guardArgs(action);
    if (!gArgs.ok) {
      history.push({ thought, action, observation: { blocked: gArgs.reason } });
      console.log(`         BLOCKED: ${gArgs.reason}`);
      continue;
    }

    // --- DISPATCH with error trapping -------------------------------------
    let observation: unknown;
    try {
      observation = await tools[action.tool].run(action.args);
      if (action.tool === "loadCsv") {
        setScratchpad((observation as { rows: Row[] }).rows);
      }
    } catch (e) {
      observation = { error: (e as Error).message };
      console.log(`         ERROR: ${(e as Error).message}`);
      history.push({ thought, action, observation });
      continue;
    }

    // --- REFLECTION -------------------------------------------------------
    const r = reflect(observation);
    if (!r.ok) {
      console.log(`         REFLECTION: ${r.issue}`);
      history.push({ thought, action, observation: { error: r.issue } });
      continue;
    }

    console.log(`         observation: ${summarize(observation)}`);
    history.push({ thought, action, observation });
  }

  return { finalMessage: `Stopped: reached maxIterations (${maxIterations}).`, history };
}

function summarize(v: unknown): string {
  if (v && typeof v === "object" && "rows" in v && Array.isArray((v as any).rows)) {
    const o = v as { rows: unknown[]; columns: string[] };
    return `{ rows: ${o.rows.length}, columns: [${o.columns.join(", ")}] }`;
  }
  return JSON.stringify(v);
}
