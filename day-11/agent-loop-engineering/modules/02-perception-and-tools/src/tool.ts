// modules/02-perception-and-tools/src/tool.ts
//
// The universal Tool contract. Every capability the agent has -- reading CSV,
// filtering rows, aggregating, replying to the user -- implements this interface.
//
// Keeping every tool identical in shape is what lets the loop (Module 04) stay
// generic: it never has to know what "loadCsv" specifically means.

export interface Tool<Args = Record<string, unknown>, Result = unknown> {
  /** Stable id. The reasoner will emit this string to invoke the tool. */
  readonly name: string;

  /** One-line, LLM-facing description. This becomes part of the prompt. */
  readonly description: string;

  /** Human-readable arg documentation. Also becomes part of the prompt. */
  readonly argsSchema: string;

  /** Execute the tool. Must be JSON-serialisable in and out. */
  run(args: Args): Promise<Result> | Result;
}

/** A registry maps name -> tool. Used by the loop to dispatch. */
export type ToolRegistry = Record<string, Tool>;

/** Render the tool catalog into text -- exactly what will land in a prompt. */
export function renderCatalog(reg: ToolRegistry): string {
  return Object.values(reg)
    .map((t) => `- ${t.name}: ${t.description}\n  args: ${t.argsSchema}`)
    .join("\n");
}
