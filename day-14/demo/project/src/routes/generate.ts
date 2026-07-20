/**
 * Generation routes.
 *
 * The route layer's ONLY jobs are:
 *   1. read + hand off the HTTP body,
 *   2. call the service,
 *   3. shape the HTTP response (including turning ValidationError into 400).
 *
 * All the AI logic lives in the services — the route stays thin.
 */
import { Router } from "express";
import type { LlmClient } from "../llm/types.js";
import { generateCode, ValidationError } from "../services/codeGenerator.js";
import { generateDocs } from "../services/docsGenerator.js";

export function createGenerateRouter(llm: LlmClient): Router {
  const router = Router();

  // POST /generate/code  — spec in, TypeScript code out.
  router.post("/generate/code", async (req, res) => {
    try {
      const result = await generateCode(llm, req.body);
      res.json(result);
    } catch (err) {
      handleError(res, err);
    }
  });

  // POST /generate/docs  — code in, documentation out.
  router.post("/generate/docs", async (req, res) => {
    try {
      const result = await generateDocs(llm, req.body?.code);
      res.json(result);
    } catch (err) {
      handleError(res, err);
    }
  });

  return router;
}

function handleError(res: import("express").Response, err: unknown): void {
  if (err instanceof ValidationError) {
    res.status(400).json({ error: err.message });
    return;
  }
  // Anything else is unexpected: log it and return a generic 500.
  console.error("Unexpected error:", err);
  res.status(500).json({ error: "Internal server error." });
}
