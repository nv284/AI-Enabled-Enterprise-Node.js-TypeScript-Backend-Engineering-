/**
 * A minimal real OpenAI-compatible client.
 *
 * You do NOT need this for the workshop — the app defaults to the simulated
 * client. It's here so you can see that swapping to a real provider is just
 * "implement the same LlmClient interface". Works with any OpenAI-compatible
 * endpoint (OpenAI, Azure OpenAI, GitHub Models, Ollama, ...).
 *
 * Uses the built-in global `fetch` (Node 18+), so there are no extra deps.
 */
import type {
  ChatMessage,
  ChatOptions,
  ChatResult,
  LlmClient,
} from "./types.js";

export interface OpenAiClientConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export class OpenAiClient implements LlmClient {
  constructor(private readonly cfg: OpenAiClientConfig) {}

  async chat(
    messages: ChatMessage[],
    options?: ChatOptions,
  ): Promise<ChatResult> {
    const response = await fetch(`${this.cfg.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.cfg.apiKey}`,
      },
      body: JSON.stringify({
        model: this.cfg.model,
        messages,
        temperature: options?.temperature ?? 0.2,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`LLM request failed (${response.status}): ${text}`);
    }

    const data = (await response.json()) as {
      choices: { message: { content: string } }[];
    };
    const content = data.choices?.[0]?.message?.content ?? "";
    return { content, provider: "openai" };
  }
}
