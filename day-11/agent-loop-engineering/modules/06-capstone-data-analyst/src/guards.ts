// modules/06-capstone-data-analyst/src/guards.ts
import { resolve, sep } from "node:path";
import type { Action, ToolRegistry } from "./types.ts";

export type GuardResult = { ok: true } | { ok: false; reason: string };

const ALLOWED_DATA_ROOT = resolve("data") + sep;

export function guardPath(path: string): GuardResult {
  const abs = resolve(path);
  if (!abs.startsWith(ALLOWED_DATA_ROOT)) {
    return { ok: false, reason: `path outside ./data/ is not allowed (${path})` };
  }
  return { ok: true };
}

export function guardToolExists(toolName: string, tools: ToolRegistry): GuardResult {
  if (toolName === "final") return { ok: true };
  if (!tools[toolName]) return { ok: false, reason: `unknown tool: ${toolName}` };
  return { ok: true };
}

export function guardArgs(action: Action): GuardResult {
  const { tool, args } = action as { tool: string; args: Record<string, unknown> };
  switch (tool) {
    case "loadCsv":
      if (typeof args.path !== "string") return { ok: false, reason: "loadCsv needs { path: string }" };
      return guardPath(args.path);
    case "aggregate":
      if (typeof args.column !== "string" || typeof args.op !== "string")
        return { ok: false, reason: "aggregate needs { column, op }" };
      return { ok: true };
    case "groupBy":
      if (
        typeof args.groupColumn !== "string" ||
        typeof args.valueColumn !== "string" ||
        typeof args.op !== "string"
      )
        return { ok: false, reason: "groupBy needs { groupColumn, valueColumn, op }" };
      return { ok: true };
    case "chart":
      if (!args.data || typeof args.data !== "object")
        return { ok: false, reason: "chart needs { data: object }" };
      return { ok: true };
    default:
      return { ok: true };
  }
}
