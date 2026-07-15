import { Router } from "express";
import { getAIAnalysis } from "../controller/aiController";

const router = Router();

/**
 * GET /ai-analysis
 */
router.get("/ai-analysis", getAIAnalysis);

export default router;