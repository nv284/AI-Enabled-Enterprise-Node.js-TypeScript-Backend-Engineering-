/**
 * Shared LLM types.
 *
 * These mirror the shape used by most real chat-completion APIs
 * (OpenAI, Azure OpenAI, GitHub Models, Ollama, ...). Because our code
 * depends on THESE types — not on any provider's SDK — swapping the
 * simulated client for a real one later does not change the rest of the app.
 */

/** Who "said" a message in the conversation. */
export type Role = "system" | "user" | "assistant";

/** A single message in a chat conversation. */
export interface ChatMessage {
  role: Role;
  content: string;
}

/** Options that influence how the model responds. */
export interface ChatOptions {
  /** 0 = deterministic/focused, 1 = creative. Use low values for code/docs. */
  temperature?: number;
}

/** The result returned by the LLM client. */
export interface ChatResult {
  /** The assistant's reply text. */
  content: string;
  /** Which backend produced it — handy for debugging/logging. */
  provider: string;
}

/**
 * The contract every LLM client must satisfy.
 * The rest of the app only ever depends on this interface.
 */
export interface LlmClient {
  chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResult>;
}
