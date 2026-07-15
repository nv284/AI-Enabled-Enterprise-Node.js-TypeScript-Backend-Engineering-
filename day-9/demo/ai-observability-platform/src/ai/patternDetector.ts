import { LogEntry } from "./logParser";

/**
 * Represents a repeated log pattern.
 */
export interface LogPattern {
    pattern: string;
    occurrences: number;
}

/**
 * Finds repeated log messages.
 *
 * Example:
 * Database Timeout
 * Database Timeout
 * Database Timeout
 *
 * =>
 * {
 *   pattern: "Database Timeout",
 *   occurrences: 3
 * }
 */
export function detectPatterns(logs: LogEntry[]): LogPattern[] {

    const messageCount = new Map<string, number>();

    // Count occurrences of each message
    for (const log of logs) {
        const message = log.message.trim();

        if (!message) {
            continue;
        }

        messageCount.set(
            message,
            (messageCount.get(message) || 0) + 1
        );
    }

    // Return only repeated messages
    return Array.from(messageCount.entries())
        .filter(([_, count]) => count > 1)
        .map(([pattern, occurrences]) => ({
            pattern,
            occurrences
        }))
        .sort((a, b) => b.occurrences - a.occurrences);
}