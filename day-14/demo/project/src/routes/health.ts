/**
 * Health-check route. The simplest possible endpoint — proves the server runs.
 */
import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});
