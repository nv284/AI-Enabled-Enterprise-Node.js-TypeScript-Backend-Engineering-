// modules/05-reflection-and-safety/src/guards.ts
//
// Pre-execution checks. Every guard returns either { ok: true } or
// { ok: false, reason: string }. The loop turns a failed guard into a
// normal observation so the reasoner gets a chance to recover.

import { resolve, sep } from "node:path";
import type { Action, ToolRegistry } from "./types.ts";

export type GuardResult = { ok: true } | { ok: false; reason: string };

const ALLOWED_DATA_ROOT = resolve("data") + sep;

/** Only allow file paths inside ./data/. Foils "../" escapes. */
export function guardPath(path: string): GuardResult {
  const abs = resolve(path);
  if (!abs.startsWith(ALLOWED_DATA_ROOT)) {
    return { ok: false, reason: `path outside ./data/ is not allowed (${path})` };
  }
  return { ok: true };
}

/** Ensure the reasoner is asking for a tool that actually exists. */
export function guardToolExists(toolName: string, tools: ToolRegistry): GuardResult {
  if (toolName === "final") return { ok: true };
  if (!tools[toolName]) return { ok: false, reason: `unknown tool: ${toolName}` };
  return { ok: true };
}

/** Very small per-tool arg validator. Real code would use Zod / JSON Schema. */
export function guardArgs(action: Action): GuardResult {
  const { tool, args } = action as { tool: string; args: Record<string, unknown> };
  switch (tool) {
    case "loadCsv":
      if (typeof args.path !== "string") return { ok: false, reason: "loadCsv needs { path: string }" };
      return guardPath(args.path);
    case "aggregate":
      if (typeof args.column !== "string") return { ok: false, reason: "aggregate needs { column: string }" };
      if (typeof args.op !== "string") return { ok: false, reason: "aggregate needs { op: string }" };
      return { ok: true };
    default:
      return { ok: true };
  }
}
