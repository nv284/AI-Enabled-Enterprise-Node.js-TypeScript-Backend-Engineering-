/// <reference types="node" />
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    ListToolsRequestSchema,
    CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import type { TextContent } from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

/**
 * Initialize the MCP Server
 * 
 * This creates your server and tells Claude Desktop:
 * "I'm listening, and here's what I can do"
 */
const server = new Server({
    name: "my-first-mcp-server",
    version: "1.0.0",
});
const transport = new StdioServerTransport();
await server.connect(transport);
/**
 * STEP 1: Define what tools Claude can use
 * 
 * This handler tells Claude: "Here are the tools I offer"
 * Every tool needs:
 *   - name: unique identifier
 *   - description: what it does (Claude reads this)
 *   - inputSchema: what arguments it needs
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "read_file",
                description:
                    "Read the contents of any file on your computer. " +
                    "Provide the file path (use ~ for home directory). " +
                    "Example: ~/Documents/notes.txt",
                inputSchema: {
                    type: "object" as const,
                    properties: {
                        file_path: {
                            type: "string",
                            description: "Full path to the file (e.g., ~/Desktop/data.txt)",
                        },
                    },
                    required: ["file_path"],
                },
            },
            {
                name: "calculate",
                description:
                    "Perform basic math calculations. " +
                    "Supports: +, -, *, /, and parentheses. " +
                    "Example: (25 * 4) + 10",
                inputSchema: {
                    type: "object" as const,
                    properties: {
                        expression: {
                            type: "string",
                            description:
                                "Math expression like '2 + 3 * 4' or '(100 / 5) - 2'",
                        },
                    },
                    required: ["expression"],
                },
            },
            {
                name: "list_files",
                description:
                    "List all files and folders in a directory. " +
                    "Useful to explore your computer structure. " +
                    "Example: ~/Documents",
                inputSchema: {
                    type: "object" as const,
                    properties: {
                        directory: {
                            type: "string",
                            description:
                                "Directory path to list (e.g., ~/Desktop or ~/Documents)",
                        },
                    },
                    required: ["directory"],
                },
            },
        ],
    };
});

/**
 * STEP 2: Handle when Claude calls a tool
 * 
 * When Claude says "use the read_file tool with path ~/notes.txt",
 * this function processes the request and returns the result
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        // ════════════════════════════════════════════════════════════════
        // TOOL 1: read_file
        // ════════════════════════════════════════════════════════════════
        if (name === "read_file") {
            // args may be undefined — safely access file_path
            const filePath = (args?.file_path as string) || "";

            if (!filePath) {
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `❌ Error: No file_path provided in tool arguments.`,
                        },
                    ],
                    isError: true,
                };
            }

            // Expand ~ to home directory
            const expandedPath = filePath.startsWith("~")
                ? filePath.replace(
                    "~",
                    process.env.HOME || process.env.USERPROFILE || ""
                )
                : filePath;

            // Security check: prevent reading outside allowed directories
            const safePath = path.resolve(expandedPath);

            // Verify file exists
            if (!fs.existsSync(safePath)) {
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `❌ Error: File not found at "${filePath}". Does the path exist?`,
                        },
                    ],
                    isError: true,
                };
            }

            // Verify it's a file, not a directory
            const stats = fs.statSync(safePath);
            if (stats.isDirectory()) {
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `❌ Error: "${filePath}" is a directory, not a file. Try using list_files instead.`,
                        },
                    ],
                    isError: true,
                };
            }

            // Read and return the file
            const content = fs.readFileSync(safePath, "utf-8");
            return {
                content: [
                    {
                        type: "text" as const,
                        text: content,
                    },
                ],
            };
        }

        // ════════════════════════════════════════════════════════════════
        // TOOL 2: calculate
        // ════════════════════════════════════════════════════════════════
        if (name === "calculate") {
            const expression = (args?.expression as string) || "";

            if (!expression) {
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `❌ Error: No expression provided in tool arguments.`,
                        },
                    ],
                    isError: true,
                };
            }

            // Security: Only allow numbers, operators, and parentheses
            // This prevents code injection
            if (!/^[\d+\-*/(). ]+$/.test(expression)) {
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `❌ Error: Invalid expression. Only numbers and operators (+, -, *, /, parentheses, spaces) are allowed.`,
                        },
                    ],
                    isError: true,
                };
            }

            try {
                // Safely evaluate the math expression
                // eslint-disable-next-line no-new-func
                const result = Function('"use strict"; return (' + expression + ")")();

                // Handle non-numeric results
                if (typeof result !== "number") {
                    return {
                        content: [
                            {
                                type: "text" as const,
                                text: `❌ Error: Expression did not return a number.`,
                            },
                        ],
                        isError: true,
                    };
                }

                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `✅ Result: ${result}`,
                        },
                    ],
                };
            } catch (e) {
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `❌ Error: Invalid math expression: ${(e as Error).message}`,
                        },
                    ],
                    isError: true,
                };
            }
        }

        // ════════════════════════════════════════════════════════════════
        // TOOL 3: list_files
        // ════════════════════════════════════════════════════════════════
        if (name === "list_files") {
            const directory = (args?.directory as string) || "";

            if (!directory) {
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `❌ Error: No directory provided in tool arguments.`,
                        },
                    ],
                    isError: true,
                };
            }

            // Expand ~ to home directory
            const expandedPath = directory.startsWith("~")
                ? directory.replace("~", os.homedir() || "")
                : directory;

            const safePath = path.resolve(expandedPath);

            // Verify directory exists
            if (!fs.existsSync(safePath)) {
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `❌ Error: Directory not found at "${directory}"`,
                        },
                    ],
                    isError: true,
                };
            }

            // Verify it's a directory, not a file
            const stats = fs.statSync(safePath);
            if (!stats.isDirectory()) {
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `❌ Error: "${directory}" is a file, not a directory.`,
                        },
                    ],
                    isError: true,
                };
            }

            // List files
            const files = fs.readdirSync(safePath);
            const fileList = files
                .map((file) => {
                    const filePath = path.join(safePath, file);
                    const isDir = fs.statSync(filePath).isDirectory();
                    return isDir ? `📁 ${file}/` : `📄 ${file}`;
                })
                .join("\n");

            return {
                content: [
                    {
                        type: "text" as const,
                        text:
                            files.length === 0
                                ? `(empty directory)`
                                : fileList,
                    },
                ],
            };
        }

        // If tool name doesn't match any of the above
        return {
            content: [
                {
                    type: "text" as const,
                    text: `❌ Unknown tool: "${name}". This shouldn't happen!`,
                },
            ],
            isError: true,
        };
    } catch (error) {
        return {
            content: [
                {
                    type: "text" as const,
                    text: `❌ Unexpected error: ${(error as Error).message}`,
                },
            ],
            isError: true,
        };
    }
});

/**
 * STEP 3: Start the server
 * 
 * StdioServerTransport connects via stdin/stdout.
 * This is the "bridge" that talks to Claude Desktop.
 */
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);

    // Log to stderr so Claude can see startup messages
    console.error(
        "🚀 [MCP Server] Started successfully. Waiting for Claude Desktop..."
    );
}

// Run the server
main().catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
});