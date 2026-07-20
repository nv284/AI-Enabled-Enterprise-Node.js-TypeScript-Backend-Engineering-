/**
 * Tests for the generation services and the simulated LLM.
 *
 * Run with:  npm test
 *
 * We test the SERVICES directly (no HTTP server needed) — this is why we kept
 * the AI logic out of the Express routes. Fast, focused, deterministic.
 */
import assert from "node:assert/strict";
import { test } from "node:test";

import { SimulatedLlmClient } from "../src/llm/SimulatedLlmClient.js";
import {
  generateCode,
  ValidationError,
} from "../src/services/codeGenerator.js";
import { generateDocs } from "../src/services/docsGenerator.js";
import { buildCodePrompt } from "../src/prompts/codePrompt.js";

const llm = new SimulatedLlmClient();

test("generateCode returns a TypeScript function matching the spec", async () => {
  const result = await generateCode(llm, {
    name: "isValidEmail",
    parameters: "email: string",
    returns: "boolean",
    description: "returns true if the string looks like an email",
  });

  assert.match(result.code, /export function isValidEmail\(email: string\): boolean/);
  assert.match(result.code, /\/\*\*/); // has a JSDoc block
  assert.equal(result.provider, "simulated");
});

test("generateCode rejects an invalid function name", async () => {
  await assert.rejects(
    () =>
      generateCode(llm, {
        name: "123-bad",
        returns: "void",
        description: "x",
      }),
    ValidationError,
  );
});

test("generateCode requires a description", async () => {
  await assert.rejects(
    () =>
      generateCode(llm, {
        name: "doThing",
        returns: "void",
        description: "",
      }),
    ValidationError,
  );
});

test("generateDocs produces JSDoc and a Usage section", async () => {
  const code = `export function add(a: number, b: number): number { return a + b; }`;
  const result = await generateDocs(llm, code);

  assert.match(result.documentation, /\/\*\*/); // JSDoc
  assert.match(result.documentation, /## Usage/);
  assert.match(result.documentation, /add\(/);
});

test("generateDocs rejects empty input", async () => {
  await assert.rejects(() => generateDocs(llm, ""), ValidationError);
});

test("buildCodePrompt includes role, task marker and guardrails", () => {
  const messages = buildCodePrompt({
    name: "sum",
    parameters: "a: number, b: number",
    returns: "number",
    description: "adds two numbers",
  });

  assert.equal(messages[0].role, "system");
  assert.match(messages[1].content, /TASK: CODE/);
  assert.match(messages[1].content, /Guardrails:/);
});
