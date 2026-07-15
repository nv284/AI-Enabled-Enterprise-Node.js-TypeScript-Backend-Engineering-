import { CorrelatedRequest } from "./correlationEngine";
import { LogPattern } from "./patternDetector";
import { LogCategory } from "./classifier";

/**
 * Root Cause Analysis result.
 */
export interface RootCauseResult {
    rootCause: string;
    confidence: string;
    recommendation: string;
}

/**
 * Returns a recommendation based on the error category.
 */
function getRecommendation(category: LogCategory): string {

    switch (category) {

        case LogCategory.DATABASE:
            return "Check database connectivity, connection pool, and database server availability.";

        case LogCategory.NETWORK:
            return "Verify network connectivity, DNS resolution, firewall rules, and endpoint availability.";

        case LogCategory.AUTHENTICATION:
            return "Validate authentication credentials, JWT tokens, and token expiration settings.";

        case LogCategory.AUTHORIZATION:
            return "Verify user permissions, roles, and access control configuration.";

        case LogCategory.VALIDATION:
            return "Review request payloads and validate required fields and input constraints.";

        default:
            return "Review application logs for additional context and investigate manually.";
    }
}

/**
 * Combines correlated logs, detected patterns,
 * and error category to determine the likely root cause.
 */
export function analyzeRootCause(
    correlatedLogs: CorrelatedRequest[],
    patterns: LogPattern[],
    category: LogCategory
): RootCauseResult {

    // Most frequent repeated pattern
    const topPattern = patterns.length > 0
        ? patterns[0]
        : null;

    // Confidence calculation
    let confidence = 60;

    if (topPattern) {
        confidence += Math.min(topPattern.occurrences * 5, 35);
    }

    if (correlatedLogs.length > 0) {
        confidence += 5;
    }

    confidence = Math.min(confidence, 99);

    return {
        rootCause: topPattern
            ? topPattern.pattern
            : "Unknown Root Cause",

        confidence: `${confidence}%`,

        recommendation: getRecommendation(category)
    };
}