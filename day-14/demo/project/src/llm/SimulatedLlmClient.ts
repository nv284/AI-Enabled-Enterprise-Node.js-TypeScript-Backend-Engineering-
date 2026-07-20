/**
 * Simulated LLM client.
 *
 * It behaves like a real chat model — same input (messages) and output (text) —
 * but produces deterministic responses locally, with NO API key and NO cost.
 *
 * How it "thinks": a real model reads your prompt and infers what you want.
 * Here we do a small, transparent version of that: we look at the prompt,
 * detect whether it's a CODE task or a DOCS task, pull out the details, and
 * return realistic output. This lets you learn prompt engineering and backend
 * wiring without paying for tokens.
 *
 * ⚠️ This is a teaching stand-in, not a real model. Real output will be richer.
 */
import type {
  ChatMessage,
  ChatOptions,
  ChatResult,
  LlmClient,
} from "./types.js";

export class SimulatedLlmClient implements LlmClient {
  async chat(
    messages: ChatMessage[],
    _options?: ChatOptions,
  ): Promise<ChatResult> {
    // Simulate a tiny bit of network latency so async behavior feels real.
    await delay(120);

    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const prompt = lastUser?.content ?? "";

    let content: string;
    if (/TASK:\s*DOCS/i.test(prompt)) {
      content = simulateDocs(prompt);
    } else if (/TASK:\s*CODE/i.test(prompt)) {
      content = simulateCode(prompt);
    } else {
      content =
        "// The simulated model did not recognize the task.\n// Add a 'TASK: CODE' or 'TASK: DOCS' marker to the prompt.";
    }

    return { content, provider: "simulated" };
  }
}

// --------------------------------------------------------------------------
// Code generation simulation
// --------------------------------------------------------------------------

function simulateCode(prompt: string): string {
  const name = extractField(prompt, "name") || "generatedFunction";
  const params = extractField(prompt, "parameters") || "";
  const returns = extractField(prompt, "returns") || "void";
  const description =
    extractField(prompt, "description") || "TODO: describe this function.";

  const paramList = parseParams(params);
  const jsDocParams = paramList
    .map((p) => ` * @param ${p.name} - ${p.type}`)
    .join("\n");
  const signatureParams = paramList
    .map((p) => `${p.name}: ${p.type}`)
    .join(", ");

  const body = defaultBodyFor(returns, description);

  return [
    "/**",
    ` * ${description}`,
    jsDocParams ? jsDocParams : null,
    ` * @returns ${returns}`,
    " */",
    `export function ${name}(${signatureParams}): ${returns} {`,
    body,
    "}",
    "",
  ]
    .filter((line) => line !== null)
    .join("\n");
}

/** Return a plausible starter body based on the declared return type. */
function defaultBodyFor(returns: string, description: string): string {
  const todo = `  // TODO: implement — ${description}`;
  const r = returns.trim().toLowerCase();
  if (r === "boolean") return `${todo}\n  return false;`;
  if (r === "number") return `${todo}\n  return 0;`;
  if (r === "string") return `${todo}\n  return "";`;
  if (r.endsWith("[]")) return `${todo}\n  return [];`;
  if (r === "void" || r === "") return `${todo}`;
  if (r.startsWith("promise")) return `${todo}\n  return undefined as never;`;
  return `${todo}\n  return undefined as never;`;
}

// --------------------------------------------------------------------------
// Documentation generation simulation
// --------------------------------------------------------------------------

function simulateDocs(prompt: string): string {
  const code = extractCodeBlock(prompt);
  const sig = parseFunctionSignature(code);

  const name = sig?.name ?? "yourFunction";
  const params = sig?.params ?? [];
  const returns = sig?.returns ?? "unknown";

  const jsDoc = [
    "/**",
    ` * ${name} — summary of what this function does.`,
    ...params.map((p) => ` * @param ${p.name} - the ${p.name} value (${p.type}).`),
    ` * @returns ${returns}`,
    " */",
  ].join("\n");

  const exampleArgs = params.map((p) => exampleValueFor(p.type)).join(", ");

  const usage = [
    "## Usage",
    "",
    "```ts",
    `import { ${name} } from "./${name}.js";`,
    "",
    `const result = ${name}(${exampleArgs});`,
    "console.log(result);",
    "```",
  ].join("\n");

  return `${jsDoc}\n\n${usage}\n`;
}

function exampleValueFor(type: string): string {
  const t = type.trim().toLowerCase();
  if (t === "string") return `"example"`;
  if (t === "number") return "42";
  if (t === "boolean") return "true";
  if (t.endsWith("[]")) return "[]";
  return "undefined";
}

// --------------------------------------------------------------------------
// Small parsing helpers (kept intentionally simple & readable)
// --------------------------------------------------------------------------

/** Extract a "- field: value" line from the structured spec prompt. */
function extractField(text: string, field: string): string | null {
  const re = new RegExp(`^\\s*-\\s*${field}\\s*:\\s*(.+)$`, "im");
  const match = text.match(re);
  return match ? match[1].trim() : null;
}

interface Param {
  name: string;
  type: string;
}

/** Parse "a: number, b: string" → [{name:'a',type:'number'}, ...]. */
function parseParams(raw: string): Param[] {
  if (!raw.trim() || raw.trim().toLowerCase() === "none") return [];
  return raw
    .split(",")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const [name, type] = chunk.split(":").map((s) => s.trim());
      return { name: name || "arg", type: type || "unknown" };
    });
}

/** Pull the code out of a ```...``` block, or return the raw text. */
function extractCodeBlock(text: string): string {
  const fenced = text.match(/```[a-z]*\n([\s\S]*?)```/i);
  return fenced ? fenced[1] : text;
}

/** Very small function-signature parser for the docs simulation. */
function parseFunctionSignature(
  code: string,
): { name: string; params: Param[]; returns: string } | null {
  const re =
    /function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*:\s*([a-zA-Z0-9_<>\[\] |]+)/;
  const m = code.match(re);
  if (!m) return null;
  return {
    name: m[1],
    params: parseParams(m[2]),
    returns: m[3].trim(),
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
