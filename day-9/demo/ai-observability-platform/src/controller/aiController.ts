import { Request, Response } from "express";

import { readLogs } from "../ai/logReader";
import { parseLogs } from "../ai/logParser";
import { correlateLogs } from "../ai/correlationEngine";
import { detectPatterns } from "../ai/patternDetector";
import { classifyLogs, LogCategory } from "../ai/classifier";
import { analyzeRootCause } from "../ai/rootCauseEngine";

/**
 * GET /ai-analysis
 *
 * Complete AI Pipeline:
 * 1. Read Logs
 * 2. Parse Logs
 * 3. Correlate Requests
 * 4. Detect Patterns
 * 5. Classify Errors
 * 6. Generate Root Cause Analysis
 * 7. Return JSON
 */
export async function getAIAnalysis(
    req: Request,
    res: Response
): Promise<void> {

    try {

        // Step 1
        const rawLogs = await readLogs();

        // Step 2
        const parsedLogs = parseLogs(rawLogs);

        // Step 3
        const correlatedLogs = correlateLogs(parsedLogs);

        // Step 4
        const patterns = detectPatterns(parsedLogs);

        // Step 5
        const classifiedLogs = classifyLogs(parsedLogs);

        // Determine the dominant error category
        const category =
            classifiedLogs.find(log => log.level === "error")?.category ??
            LogCategory.UNKNOWN;

        // Step 6
        const analysis = analyzeRootCause(
            correlatedLogs,
            patterns,
            category
        );

        // Step 7
        res.status(200).json({
            success: true,

            summary: {
                totalLogs: parsedLogs.length,
                totalRequests: correlatedLogs.length,
                repeatedPatterns: patterns.length
            },

            rootCauseAnalysis: analysis,

            patterns,

            correlatedRequests: correlatedLogs,

            classifiedLogs
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to analyze logs."
        });
    }
}