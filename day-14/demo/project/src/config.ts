/**
 * Central configuration, read once from environment variables.
 *
 * Defaults are chosen so the app runs with ZERO setup using the simulated LLM.
 * `process.env` values only matter if you opt into a real provider later.
 */
export interface AppConfig {
  port: number;
  llmProvider: "simulated" | "openai";
  openai: {
    apiKey: string;
    baseUrl: string;
    model: string;
  };
}

export const config: AppConfig = {
  port: Number(process.env.PORT ?? 3000),
  llmProvider:
    process.env.LLM_PROVIDER === "openai" ? "openai" : "simulated",
  openai: {
    apiKey: process.env.OPENAI_API_KEY ?? "",
    baseUrl: process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  },
};
