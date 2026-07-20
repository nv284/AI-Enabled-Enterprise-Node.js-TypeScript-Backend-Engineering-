/**
 * Prompt builder for DOCUMENTATION generation.
 *
 * 🤖 Another "prompt inside the app". It asks the model to produce docs in a
 * fixed, two-part shape (JSDoc + a "## Usage" Markdown section) so the output
 * is predictable and easy to display.
 */
import type { ChatMessage } from "../llm/types.js";

const SYSTEM_PROMPT =
  "You are a meticulous technical writer for a TypeScript codebase. " +
  "You document only what the code actually does — you never invent behavior.";

export function buildDocsPrompt(code: string): ChatMessage[] {
  const userPrompt = [
    "TASK: DOCS",
    "Write documentation for the TypeScript function below.",
    "",
    "Output format (exactly, in this order):",
    "1. A JSDoc block suitable to place directly above the function.",
    '2. A "## Usage" Markdown section containing ONE runnable code example.',
    "",
    "Guardrails:",
    "- Base everything ONLY on the provided code.",
    "- Do NOT invent parameters, return values, or side effects.",
    "- No extra commentary before or after the two sections.",
    "",
    "Code:",
    "```ts",
    code.trim(),
    "```",
  ].join("\n");

  return [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userPrompt },
  ];
}
