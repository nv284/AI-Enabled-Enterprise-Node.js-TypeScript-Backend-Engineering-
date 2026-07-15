import { LogEntry } from "./logParser";

/**
 * Represents all logs that belong to one request.
 */
export interface CorrelatedRequest {
    requestId: string;
    logs: LogEntry[];
}

/**
 * Groups log entries by requestId.
 *
 * Example:
 * REQ-1001
 *   -> Controller Started
 *   -> Reading Users
 *   -> Database Connected
 *   -> Returning Response
 */
export function correlateLogs(
    logEntries: LogEntry[]
): CorrelatedRequest[] {

    const requestMap = new Map<string, LogEntry[]>();

    for (const log of logEntries) {

        const requestId = log.requestId || "UNKNOWN";

        if (!requestMap.has(requestId)) {
            requestMap.set(requestId, []);
        }

        requestMap.get(requestId)!.push(log);
    }

    return Array.from(requestMap.entries()).map(
        ([requestId, logs]) => ({
            requestId,
            logs
        })
    );
}