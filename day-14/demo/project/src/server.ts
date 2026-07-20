/**
 * Builds the Express app (without starting it).
 *
 * Keeping "build the app" separate from "listen on a port" makes the app easy
 * to import into tests (you can call routes without opening a real socket).
 */
import express, { type Express } from "express";
import { createLlmClient } from "./llm/index.js";
import { createGenerateRouter } from "./routes/generate.js";
import { healthRouter } from "./routes/health.js";

export function createApp(): Express {
  const app = express();

  // Parse JSON request bodies.
  app.use(express.json());

  // One shared LLM client for the whole app (simulated or real).
  const llm = createLlmClient();

  app.use(healthRouter);
  app.use(createGenerateRouter(llm));

  return app;
}
