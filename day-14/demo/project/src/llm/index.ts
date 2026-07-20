/**
 * LLM factory — the single place that decides WHICH client the app uses.
 *
 * Because everything else depends only on the `LlmClient` interface, this is
 * the ONE file you touch to switch between the simulated model and a real one.
 */
import { config } from "../config.js";
import { OpenAiClient } from "./OpenAiClient.js";
import { SimulatedLlmClient } from "./SimulatedLlmClient.js";
import type { LlmClient } from "./types.js";

export function createLlmClient(): LlmClient {
  if (config.llmProvider === "openai") {
    if (!config.openai.apiKey) {
      throw new Error(
        "LLM_PROVIDER=openai but OPENAI_API_KEY is not set. See .env.example.",
      );
    }
    return new OpenAiClient(config.openai);
  }
  return new SimulatedLlmClient();
}

export type { LlmClient, ChatMessage, ChatResult } from "./types.js";
