/**
 * Prompt builder for CODE generation.
 *
 * 🤖 This is a "prompt inside the app": it turns a structured spec into the
 * messages we send to the LLM. Notice how the prompt has clear PARTS
 * (role, task, spec/context, output format, guardrails) — exactly the
 * anatomy from Module 2.
 *
 * Keeping prompts in their own file means we can version, review and TEST them
 * like any other code.
 */
import type { ChatMessage } from "../llm/types.js";

/** The structured input a caller provides to generate a function. */
export interface CodeSpec {
  name: string;
  /** e.g. "email: string, options: number" — or "none". */
  parameters?: string;
  /** e.g. "boolean". */
  returns: string;
  description: string;
}

/** Role + rules that apply to the whole request. */
const SYSTEM_PROMPT =
  "You are a senior TypeScript engineer who writes clean, minimal, " +
  "production-quality code.";

export function buildCodePrompt(spec: CodeSpec): ChatMessage[] {
  const userPrompt = [
    "TASK: CODE",
    "Implement exactly ONE TypeScript function that satisfies this spec.",
    "",
    "Spec:",
    `- name: ${spec.name}`,
    `- parameters: ${spec.parameters?.trim() || "none"}`,
    `- returns: ${spec.returns}`,
    `- description: ${spec.description}`,
    "",
    "Output format:",
    "- Return ONLY TypeScript source code.",
    "- No markdown code fences, no explanations, no apologies.",
    "- Include a JSDoc comment above the function.",
    "",
    "Guardrails:",
    "- Do NOT add parameters that are not in the spec.",
    "- Do NOT access the network or filesystem.",
    "- If the behavior is ambiguous, leave a `// TODO:` comment in the body.",
  ].join("\n");

  return [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userPrompt },
  ];
}
