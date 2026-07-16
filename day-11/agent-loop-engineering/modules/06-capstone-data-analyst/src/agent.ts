// modules/06-capstone-data-analyst/src/agent.ts
//
// The full loop, unchanged from Module 05. This is production shape:
// guarded dispatch, try/catch, post-hoc reflection, iteration cap, full trace.

import type { Reasoner, Step, ToolRegistry } from "./types.ts";
import { setScratchpad, type Row } from "./tools.ts";
import { guardArgs, guardToolExists } from "./guards.ts";
import { reflect } from "./reflect.ts";

export interface RunOptions {
  goal: string;
  reasoner: Reasoner;
  tools: ToolRegistry;
  maxIterations?: number;
  verbose?: boolean;
}

export interface RunResult {
  finalMessage: string;
  history: Step[];
}

export function renderCatalog(tools: ToolRegistry): string {
  return Object.values(tools)
    .map((t) => `- ${t.name}: ${t.description}\n  args: ${t.argsSchema}`)
    .join("\n");
}

export async function runAgent(opts: RunOptions): Promise<RunResult> {
  const { goal, reasoner, tools, maxIterations = 8, verbose = true } = opts;
  const history: Step[] = [];
  const catalog = renderCatalog(tools);
  const log = (s: string) => { if (verbose) console.log(s); };

  for (let turn = 1; turn <= maxIterations; turn++) {
    const { thought, action } = reasoner({ goal, history, catalog });
    log(`\n[turn ${turn}] thought: ${thought}`);
    log(`         action: ${action.tool}(${JSON.stringify(action.args)})`);

    if (action.tool === "final") {
      return { finalMessage: (action.args as { message: string }).message, history };
    }

    const gExists = guardToolExists(action.tool, tools);
    if (!gExists.ok) {
      history.push({ thought, action, observation: { blocked: gExists.reason } });
      log(`         BLOCKED: ${gExists.reason}`);
      continue;
    }
    const gArgs = guardArgs(action);
    if (!gArgs.ok) {
      history.push({ thought, action, observation: { blocked: gArgs.reason } });
      log(`         BLOCKED: ${gArgs.reason}`);
      continue;
    }

    let observation: unknown;
    try {
      observation = await tools[action.tool].run(action.args);
      if (action.tool === "loadCsv") {
        setScratchpad((observation as { rows: Row[] }).rows);
      }
    } catch (e) {
      observation = { error: (e as Error).message };
      log(`         ERROR: ${(e as Error).message}`);
      history.push({ thought, action, observation });
      continue;
    }

    const r = reflect(observation);
    if (!r.ok) {
      log(`         REFLECTION: ${r.issue}`);
      history.push({ thought, action, observation: { error: r.issue } });
      continue;
    }

    log(`         observation: ${summarize(observation)}`);
    history.push({ thought, action, observation });
  }

  return { finalMessage: `Stopped: reached maxIterations (${maxIterations}).`, history };
}

function summarize(v: unknown): string {
  if (v && typeof v === "object" && "rows" in v && Array.isArray((v as any).rows)) {
    const o = v as { rows: unknown[]; columns: string[] };
    return `{ rows: ${o.rows.length}, columns: [${o.columns.join(", ")}] }`;
  }
  const s = typeof v === "string" ? v : JSON.stringify(v);
  return s.length > 200 ? s.slice(0, 200) + "..." : s;
}
