/**
 * Represents a normalized log entry.
 */
export interface LogEntry {
    timestamp: string;
    level: string;
    requestId: string;
    correlationId: string;
    message: string;
}

/**
 * Converts a single JSON log line into a normalized LogEntry.
 * Returns null if the line is not valid JSON.
 */
function parseLogLine(line: string): LogEntry | null {
    try {
        const log = JSON.parse(line);

        return {
            timestamp: String(log.timestamp ?? ""),
            level: String(log.level ?? "").toLowerCase(),
            requestId: String(log.requestId ?? ""),
            correlationId: String(log.correlationId ?? ""),
            message: String(log.message ?? "")
        };
    } catch {
        // Ignore invalid JSON
        return null;
    }
}

/**
 * Converts an array of JSON log strings into
 * normalized LogEntry objects.
 */
export function parseLogs(logLines: string[]): LogEntry[] {

    const parsedLogs: LogEntry[] = [];

    for (const line of logLines) {

        const log = parseLogLine(line);

        if (log !== null) {
            parsedLogs.push(log);
        }
    }

    return parsedLogs;
}