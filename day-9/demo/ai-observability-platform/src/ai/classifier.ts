import { LogEntry } from "./logParser";

/**
 * Supported log categories.
 */
export enum LogCategory {
    DATABASE = "DATABASE",
    NETWORK = "NETWORK",
    AUTHENTICATION = "AUTHENTICATION",
    AUTHORIZATION = "AUTHORIZATION",
    VALIDATION = "VALIDATION",
    UNKNOWN = "UNKNOWN"
}

/**
 * Classification result.
 */
export interface ClassifiedLog extends LogEntry {
    category: LogCategory;
}

/**
 * Maps a log message to a category.
 */
export function classifyMessage(message: string): LogCategory {

    const text = message.toLowerCase();

    // DATABASE
    if (
        text.includes("database") ||
        text.includes("sql") ||
        text.includes("query") ||
        text.includes("jdbc") ||
        text.includes("connection") ||
        text.includes("timeout")
    ) {
        return LogCategory.DATABASE;
    }

    // NETWORK
    if (
        text.includes("network") ||
        text.includes("socket") ||
        text.includes("dns") ||
        text.includes("host") ||
        text.includes("http") ||
        text.includes("https") ||
        text.includes("connection refused")
    ) {
        return LogCategory.NETWORK;
    }

    // AUTHENTICATION
    if (
        text.includes("jwt") ||
        text.includes("token") ||
        text.includes("login") ||
        text.includes("authentication") ||
        text.includes("expired") ||
        text.includes("invalid credentials")
    ) {
        return LogCategory.AUTHENTICATION;
    }

    // AUTHORIZATION
    if (
        text.includes("forbidden") ||
        text.includes("access denied") ||
        text.includes("unauthorized") ||
        text.includes("permission") ||
        text.includes("role")
    ) {
        return LogCategory.AUTHORIZATION;
    }

    // VALIDATION
    if (
        text.includes("validation") ||
        text.includes("invalid") ||
        text.includes("required") ||
        text.includes("missing") ||
        text.includes("constraint")
    ) {
        return LogCategory.VALIDATION;
    }

    return LogCategory.UNKNOWN;
}

/**
 * Classifies all parsed log entries.
 */
export function classifyLogs(logs: LogEntry[]): ClassifiedLog[] {

    return logs.map(log => ({
        ...log,
        category: classifyMessage(log.message)
    }));
}