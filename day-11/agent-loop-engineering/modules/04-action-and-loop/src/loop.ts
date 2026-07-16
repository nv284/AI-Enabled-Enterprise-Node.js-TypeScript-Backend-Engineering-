// modules/04-action-and-loop/src/loop.ts
//
// The generic agent loop. Fewer than 40 lines of real logic.
// It does NOT know what any specific tool does; it just dispatches.

import type { Reasoner, Step, ToolRegistry } from "./types.ts";
import { setScratchpad, type Row } from "./tools.ts";

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
    const decision = reasoner({ goal, history, catalog });

    console.log(`\n[turn ${turn}] thought: ${decision.thought}`);
    console.log(
      `         action: ${decision.action.tool}(${JSON.stringify(decision.action.args)})`,
    );

    // Exit condition: final answer.
    if (decision.action.tool === "final") {
      return {
        finalMessage: (decision.action.args as { message: string }).message,
        history,
      };
    }

    // Dispatch.
    const tool = tools[decision.action.tool];
    if (!tool) {
      throw new Error(`Reasoner called unknown tool: ${decision.action.tool}`);
    }
    const observation = await tool.run(decision.action.args);

    // Side effect specific to this module's tool set: keep rows around
    // so aggregate/groupBy can see them.
    if (decision.action.tool === "loadCsv") {
      setScratchpad((observation as { rows: Row[] }).rows);
    }

    console.log(
      `         observation: ${summarize(observation)}`,
    );

    history.push({
      thought: decision.thought,
      action: decision.action,
      observation,
    });
  }

  return {
    finalMessage: `Stopped: reached maxIterations (${maxIterations}).`,
    history,
  };
}

/** Keep console output readable. */
function summarize(v: unknown): string {
  if (v && typeof v === "object" && "rows" in v && Array.isArray((v as any).rows)) {
    const o = v as { rows: unknown[]; columns: string[] };
    return `{ rows: ${o.rows.length}, columns: [${o.columns.join(", ")}] }`;
  }
  return JSON.stringify(v);
}
