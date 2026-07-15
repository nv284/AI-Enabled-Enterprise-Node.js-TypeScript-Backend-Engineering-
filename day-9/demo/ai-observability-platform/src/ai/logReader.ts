import fs from "fs/promises";
import path from "path";

/**
 * Location of log files.
 * process.cwd() points to the project root.
 */
const LOG_DIRECTORY = path.join(process.cwd(), "logs");

const APPLICATION_LOG = path.join(LOG_DIRECTORY, "application.log");
const ERROR_LOG = path.join(LOG_DIRECTORY, "error.log");

/**
 * Reads a single log file.
 * - Returns all non-empty lines.
 * - Ignores blank lines.
 * - Returns an empty array if the file does not exist.
 */
async function readLogFile(filePath: string): Promise<string[]> {
    try {
        const fileContent = await fs.readFile(filePath, "utf-8");

        return fileContent
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

    } catch (error: any) {
        // File not found
        if (error.code === "ENOENT") {
            console.warn(`Log file not found: ${filePath}`);
            return [];
        }

        throw error;
    }
}

/**
 * Reads application.log and error.log
 * and returns a combined array of log entries.
 */
export async function readLogs(): Promise<string[]> {

    const applicationLogs = await readLogFile(APPLICATION_LOG);

    const errorLogs = await readLogFile(ERROR_LOG);

    return [...applicationLogs, ...errorLogs];
}