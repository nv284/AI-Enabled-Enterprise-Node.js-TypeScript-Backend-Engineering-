/**
 * Code generation service.
 *
 * Orchestrates the workflow for turning a spec into TypeScript code:
 *   validate → build prompt → call LLM → clean output → return.
 *
 * This is deliberately separate from the Express route so it can be unit-tested
 * and reused (e.g. from a CLI) without any HTTP involved.
 */
import type { LlmClient } from "../llm/types.js";
import { buildCodePrompt, type CodeSpec } from "../prompts/codePrompt.js";
import { stripCodeFences } from "./sanitize.js";

export interface CodeGenerationResult {
  code: string;
  provider: string;
}

/** Thrown when the caller's spec is invalid. Routes turn this into HTTP 400. */
export class ValidationError extends Error {}

export async function generateCode(
  llm: LlmClient,
  spec: CodeSpec,
): Promise<CodeGenerationResult> {
  validateSpec(spec);

  const messages = buildCodePrompt(spec);
  // Low temperature → stable, repeatable code output.
  const { content, provider } = await llm.chat(messages, { temperature: 0.2 });

  return { code: stripCodeFences(content), provider };
}

function validateSpec(spec: CodeSpec): void {
  if (!spec || typeof spec !== "object") {
    throw new ValidationError("Request body must be a JSON object.");
  }
  if (!isNonEmptyString(spec.name)) {
    throw new ValidationError("`name` is required and must be a string.");
  }
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(spec.name)) {
    throw new ValidationError(
      "`name` must be a valid identifier (letters, digits, underscore; not starting with a digit).",
    );
  }
  if (!isNonEmptyString(spec.returns)) {
    throw new ValidationError("`returns` is required and must be a string.");
  }
  if (!isNonEmptyString(spec.description)) {
    throw new ValidationError("`description` is required and must be a string.");
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
