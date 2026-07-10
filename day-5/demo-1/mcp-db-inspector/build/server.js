"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
// 1. Initialize the In-Memory Database and Seed Data
/** @type {import("sqlite").Database} */
let db;
async function initDb() {
    db = await open({
        filename: ":memory:",
        driver: sqlite3.Database,
    });
    // Create a mock system logs table
    await db.exec(`
    CREATE TABLE system_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      service_name TEXT,
      level TEXT,
      message TEXT
    );
  `);
    // Seed mock data
    await db.exec(`
    INSERT INTO system_logs (service_name, level, message) VALUES 
    ('auth-service', 'INFO', 'User user_4421 logged in successfully'),
    ('payment-gateway', 'ERROR', 'Timeout connecting to Stripe API'),
    ('cart-service', 'WARN', 'High latency detected on checkout endpoint');
  `);
}
// 2. Initialize the MCP Server
const server = new McpServer({
    name: "in-memory-db-inspector",
    version: "1.0.0",
});
// 3. Register Tool: List All Tables
server.tool("list_tables", "Lists all database tables available for inspection", {}, // No input parameters needed
async () => {
    const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
    return {
        content: [{ type: "text", text: JSON.stringify(tables, null, 2) }],
    };
});
// 4. Register Tool: Run Read Query
server.tool("run_read_query", "Executes a safe SELECT query against the in-memory database to inspect data", {
    sql: z.string().describe("The SQL SELECT statement to execute."),
}, async ({ sql }) => {
    // Basic guardrail: Only allow read operations
    if (!sql.trim().toLowerCase().startsWith("select")) {
        return {
            content: [{ type: "text", text: "Error: Only SELECT queries are allowed for inspection." }],
            isError: true,
        };
    }
    try {
        const results = await db.all(sql);
        return {
            content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
        };
    }
    catch (error) {
        return {
            content: [{ type: "text", text: `SQL Error: ${error.message}` }],
            isError: true,
        };
    }
});
// 5. Start the Server using Stdio Transport
async function main() {
    await initDb();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("In-Memory DB Inspector MCP Server running on stdio");
}
main().catch((err) => {
    console.error("Server crashed:", err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map