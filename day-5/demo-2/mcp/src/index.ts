#!/usr/bin/env node
declare const process: any;
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTools } from "./tools.js";

async function main(): Promise<void> {
  const server = new McpServer({
    name: "support-tickets",
    version: "1.0.0",
  });

  registerTools(server);

  // stdio transport: the MCP client (Inspector, Claude Desktop, VS Code)
  // launches this process and exchanges JSON-RPC over stdin/stdout.
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log to stderr only — stdout is reserved for the MCP protocol.
  console.error("[support-tickets] MCP server ready on stdio");
}

main().catch((err) => {
  console.error("[support-tickets] Fatal error:", err);
  process.exit(1);
});
