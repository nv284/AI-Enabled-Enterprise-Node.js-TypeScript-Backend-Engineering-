/**
 * Documentation generation service.
 *
 * Turns a snippet of TypeScript code into documentation:
 *   validate → build prompt → call LLM → return.
 */
import type { LlmClient } from "../llm/types.js";
import { buildDocsPrompt } from "../prompts/docsPrompt.js";
import { ValidationError } from "./codeGenerator.js";

export interface DocsGenerationResult {
  documentation: string;
  provider: string;
}

export async function generateDocs(
  llm: LlmClient,
  code: string,
): Promise<DocsGenerationResult> {
  if (typeof code !== "string" || code.trim().length === 0) {
    throw new ValidationError("`code` is required and must be a non-empty string.");
  }
  if (code.length > 5000) {
    throw new ValidationError("`code` is too large (max 5000 characters).");
  }

  const messages = buildDocsPrompt(code);
  const { content, provider } = await llm.chat(messages, { temperature: 0.2 });

  return { documentation: content.trim(), provider };
}
