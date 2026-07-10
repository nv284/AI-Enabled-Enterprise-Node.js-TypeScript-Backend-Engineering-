# Walkthrough: Build a Model Context Protocol (MCP) Server from scratch

A step-by-step, training-friendly guide to building **`mcp-support-tickets`** — a real MCP server that lets any LLM (Claude, GPT-4, Gemini via a compatible client) read and modify a "support tickets" backend using natural language.

Each step lists **what you type as a human** and — for AI-assisted development (e.g. GitHub Copilot Chat, Cursor, Claude Code, Windsurf) — **a suggested prompt** you can paste into the assistant to have it generate the code for you.

> **Session context**: This walkthrough backs the training session **"MCP Basics: AI-enabled integration of LLMs with backend APIs"**. The narrative arc is:
>
> 1. Understand the *why* — the "USB-C port for AI" analogy.
> 2. Build the server with the official `@modelcontextprotocol/sdk`.
> 3. Wire it into a real client and orchestrate agentic tasks.

---

## Table of contents

- [Part 0 — Concepts (5 min)](#part-0--concepts-5-min)
- [Part 1 — Scaffold the project](#part-1--scaffold-the-project)
- [Part 2 — Model the "backend"](#part-2--model-the-backend)
- [Part 3 — Register your first MCP tool](#part-3--register-your-first-mcp-tool)
- [Part 4 — Add the rest of the tools](#part-4--add-the-rest-of-the-tools)
- [Part 5 — Bootstrap the server on stdio](#part-5--bootstrap-the-server-on-stdio)
- [Part 6 — Build and run](#part-6--build-and-run)
- [Part 7 — Test with the MCP Inspector](#part-7--test-with-the-mcp-inspector)
- [Part 8 — Wire the server into an AI client](#part-8--wire-the-server-into-an-ai-client)
- [Part 9 — Agentic AI: end-to-end demo scenarios](#part-9--agentic-ai-end-to-end-demo-scenarios)
- [Part 10 — Beyond tools: Resources & Prompts (bonus)](#part-10--beyond-tools-resources--prompts-bonus)
- [Troubleshooting](#troubleshooting)

---

## Part 0 — Concepts (5 min)

Before writing code, cover these ideas with the audience.

### What is MCP?

> The Model Context Protocol is an **open standard** (from Anthropic, Nov 2024) that defines how an LLM talks to external systems. It replaces bespoke, one-off "function calling" wiring with a **portable protocol**: build the server once, plug it into any MCP-compatible client.

### The "USB-C for AI" analogy

| Without MCP                             | With MCP                                    |
| --------------------------------------- | ------------------------------------------- |
| Custom function-calling glue per LLM    | One server ↔ many clients                   |
| Vendor lock-in (OpenAI tools, Claude…)  | Vendor-neutral protocol                     |
| Ad-hoc auth & transport                 | Standardised transports (stdio, HTTP)       |
| Prompt-injection risk on every call     | Clear boundary + host approval per tool     |

### The three core primitives

| Primitive     | Analogy                    | Who initiates?     | Example                                       |
| ------------- | -------------------------- | ------------------ | --------------------------------------------- |
| **Tools**     | Function the model calls   | Model / agent      | `create_ticket({...})`                        |
| **Resources** | Files the model can read   | Model requests URI | `tickets://open` returns JSON of open tickets |
| **Prompts**   | Reusable prompt templates  | User picks one     | "Draft a customer apology for ticket X"       |

This project focuses on **Tools** (the most common primitive). Resources and Prompts are covered as a bonus at the end.

### Architecture at a glance

```
┌────────────┐   JSON-RPC over stdio    ┌─────────────────────────┐
│ MCP Client │ ───────────────────────▶ │ MCP Server              │
│ (Inspector,│ ◀─────────────────────── │ (this project)          │
│  Claude,   │                          │  ├─ tools/list          │
│  VS Code)  │                          │  ├─ tools/call          │
└────────────┘                          │  └─ backend (in-memory) │
                                        └─────────────────────────┘
```

---

## Part 1 — Scaffold the project

Create a new folder and initialise a Node/TypeScript project.

```powershell
mkdir mcp-support-tickets
cd mcp-support-tickets
npm init -y
npm install @modelcontextprotocol/sdk zod
npm install -D typescript @types/node
npx tsc --init
```

Edit `package.json` to set `"type": "module"` and add build/start scripts:

```json
{
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "inspect": "npx --yes @modelcontextprotocol/inspector node dist/index.js"
  }
}
```

Edit `tsconfig.json` to target ES2022 + NodeNext modules and emit to `./dist`.

### AI prompt for this step

> _"Scaffold a Node.js + TypeScript project called `mcp-support-tickets`. Use `type: module`, output to `dist/`, target ES2022 with NodeNext module resolution, strict mode on. Install `@modelcontextprotocol/sdk` and `zod` as runtime deps, and `typescript` + `@types/node` as devDeps. Add npm scripts `build`, `start`, and `inspect` (the last one runs `@modelcontextprotocol/inspector` against the built server)."_

---

## Part 2 — Model the "backend"

In a real project the MCP server would call your enterprise API, database, or SaaS. For training we use an in-memory store so trainees can focus on MCP itself.

Create [src/data.ts](src/data.ts) with:

- `Customer` and `Ticket` types
- Seed data (3 customers, 4 tickets)
- Pure functions: `listTickets`, `getTicket`, `searchTickets`, `createTicket`, `updateTicketStatus`, `listCustomers`, `getCustomer`

**Key teaching point:** MCP tools should be thin wrappers around backend calls. Keep business logic in `data.ts`, not in the tool handler.

### AI prompt for this step

> _"Create `src/data.ts` for an in-memory support-ticket backend. Export TypeScript types `Customer` (id, name, email), `Ticket` (id, customerId, subject, description, status: 'open'|'in_progress'|'resolved'|'closed', priority: 'low'|'medium'|'high'|'urgent', createdAt, updatedAt). Seed 3 customers and 4 tickets. Export pure functions: `listTickets(filters?)`, `getTicket(id)`, `searchTickets(query)`, `createTicket(input)`, `updateTicketStatus(id, status)`, `listCustomers()`, `getCustomer(id)`. Throw on unknown customer / ticket ids."_

---

## Part 3 — Register your first MCP tool

Now the moment of truth: expose `list_tickets` as an MCP tool.

Create [src/tools.ts](src/tools.ts) and register one tool:

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { listTickets } from "./data.js";

export function registerTools(server: McpServer): void {
  server.registerTool(
    "list_tickets",
    {
      title: "List Tickets",
      description: "List support tickets, optionally filtered by status, priority, or customer.",
      inputSchema: {
        status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        customerId: z.string().optional(),
      },
    },
    async ({ status, priority, customerId }) => {
      const results = listTickets({ status, priority, customerId });
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      };
    },
  );
}
```

### Teaching points

1. **`registerTool(name, config, handler)`** — the SDK's high-level API.
2. **`inputSchema`** — a Zod object *shape*. The SDK converts it to JSON Schema so the LLM knows exactly what to send.
3. **Return shape** — always `{ content: [...] }` with `type: "text"` (or `image`, `resource`, …). MCP is content-typed.
4. **`isError: true`** — for recoverable failures (see later tools). Throwing is fine too; the SDK converts it.

### AI prompt for this step

> _"In `src/tools.ts` create an `export function registerTools(server: McpServer)` that registers a single MCP tool `list_tickets`. Use `server.registerTool` from `@modelcontextprotocol/sdk/server/mcp.js`. The input schema (Zod) has optional `status`, `priority`, `customerId`. The handler calls `listTickets()` from `./data.js` and returns the results as a JSON string inside a text content block."_

---

## Part 4 — Add the rest of the tools

Extend [src/tools.ts](src/tools.ts) with the full set:

| Tool                   | Type   |
| ---------------------- | ------ |
| `list_tickets`         | Read   |
| `get_ticket`           | Read   |
| `search_tickets`       | Read   |
| `list_customers`       | Read   |
| `get_customer`         | Read   |
| `create_ticket`        | Action |
| `update_ticket_status` | Action |

**Teaching point — read vs. action tools:**

- **Read tools** are safe by default. Clients usually run them without asking the user.
- **Action tools** (create/update/delete) should have crystal-clear names and descriptions so the client can prompt the user for approval. Never do a destructive action silently.

### AI prompt for this step

> _"Extend `src/tools.ts` with six more tools: `get_ticket(id)`, `search_tickets(query)`, `list_customers()`, `get_customer(id)`, `create_ticket({customerId, subject, description, priority})`, `update_ticket_status({id, status})`. For unknown ids return `{ isError: true, content: [{ type: 'text', text: '...' }] }`. All handlers should call the corresponding function in `./data.js` and return JSON in a text content block. Add `.describe(...)` to every Zod field so the LLM sees good hints."_

---

## Part 5 — Bootstrap the server on stdio

Create [src/index.ts](src/index.ts):

```ts
#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTools } from "./tools.js";

async function main() {
  const server = new McpServer({ name: "support-tickets", version: "1.0.0" });
  registerTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("[support-tickets] MCP server ready on stdio");
}

main().catch((err) => {
  console.error("[support-tickets] Fatal:", err);
  process.exit(1);
});
```

### Critical teaching points

1. **stdio transport** = the client spawns your process; MCP messages flow over stdin/stdout as line-delimited JSON-RPC.
2. **Never write to `stdout`** except through the SDK. Any stray `console.log` will corrupt the protocol. Always use `console.error` (goes to stderr) for logs.
3. The **shebang** (`#!/usr/bin/env node`) + `"bin"` entry in `package.json` lets clients launch the server as an executable.

### AI prompt for this step

> _"Create `src/index.ts` that instantiates an `McpServer` (name: `support-tickets`, version: `1.0.0`), calls `registerTools(server)`, connects a `StdioServerTransport`, and logs 'ready' to stderr. Handle top-level errors by logging to stderr and exiting with code 1. Add a `#!/usr/bin/env node` shebang."_

---

## Part 6 — Build and run

```powershell
npm run build
npm start
```

The server prints `[support-tickets] MCP server ready on stdio` to stderr and blocks waiting for JSON-RPC. That's expected — it's meant to be launched by a client, not run standalone.

Press **Ctrl+C** to stop.

---

## Part 7 — Test with the MCP Inspector

The [MCP Inspector](https://github.com/modelcontextprotocol/inspector) is Anthropic's official debugger. It gives you a web UI to call tools without needing an LLM.

```powershell
npm run inspect
```

This launches Inspector (a small local web app) and connects it to your server. In the browser:

1. Click **Connect** (the transport is pre-filled with `node dist/index.js`).
2. Click **List Tools** — you should see all 7 tools with their schemas.
3. Try each one:
   - `list_tickets` → `{ "status": "open" }` → 2 tickets returned.
   - `search_tickets` → `{ "query": "login" }` → 1 ticket.
   - `create_ticket` → `{ "customerId": "C-002", "subject": "App crashes on startup", "description": "iOS 18.2, iPhone 14", "priority": "high" }` → new `T-1005` created.
   - `update_ticket_status` → `{ "id": "T-1001", "status": "in_progress" }`.

> **Demo tip:** Show the raw JSON-RPC in the Inspector's "History" pane. It makes the protocol tangible.

### AI prompt for this step

> _"How do I test my MCP server locally without an LLM? I want to inspect the exposed tools and call them manually."_
>
> (Expected answer from the assistant: use `@modelcontextprotocol/inspector` — which we've already wired as `npm run inspect`.)

---

## Part 8 — Wire the server into an AI client

Now the payoff: hand the tools to a real LLM.

### Option A — Claude Desktop

Edit `%APPDATA%\Claude\claude_desktop_config.json` (create it if missing):

```json
{
  "mcpServers": {
    "support-tickets": {
      "command": "node",
      "args": ["C:\\ABSOLUTE\\PATH\\TO\\mcp-support-tickets\\dist\\index.js"]
    }
  }
}
```

Fully quit Claude Desktop and reopen it. The 🔌 icon should show **support-tickets** connected with 7 tools.

### Option B — VS Code (GitHub Copilot Chat / Agent Mode)

Add `.vscode/mcp.json` to any workspace:

```json
{
  "servers": {
    "support-tickets": {
      "type": "stdio",
      "command": "node",
      "args": ["C:\\ABSOLUTE\\PATH\\TO\\mcp-support-tickets\\dist\\index.js"]
    }
  }
}
```

Open Copilot Chat in **Agent** mode and the tools become available.

### AI prompt for this step

> _"How do I register a local stdio MCP server with Claude Desktop on Windows? Show me the exact config file location and JSON structure."_

---

## Part 9 — Agentic AI: end-to-end demo scenarios

This is where the "aha!" moment happens. Ask the LLM natural-language questions and watch it choose tools, chain them, and reason about results.

### Scenario 1 — Simple lookup

> _"Show me all urgent support tickets."_

The LLM calls `list_tickets({ priority: "urgent" })` and formats the result.

### Scenario 2 — Multi-step orchestration

> _"Alice has been reporting login issues. Find her open tickets, and if any look critical, mark them as in-progress and draft a reply."_

Watch it chain:
1. `list_customers()` → find Alice's id (`C-001`).
2. `list_tickets({ customerId: "C-001", status: "open" })`.
3. `search_tickets({ query: "login" })` (optional refinement).
4. `update_ticket_status({ id: "T-1001", status: "in_progress" })` — the client **asks you to approve** this write.
5. Compose a natural-language reply.

**Teaching point:** the model didn't need to be taught the workflow — the *tool descriptions* were enough. That's the power of agentic AI over MCP.

### Scenario 3 — File a new ticket from a bug report

> _"I just got this email from Bob: 'App crashes every time I open the settings page on Android 14.' Please file a support ticket for him at high priority."_

The LLM calls `list_customers()` → finds Bob → `create_ticket({...})` → confirms.

### Scenario 4 — Safety demo (deliberate failure)

> _"Delete ticket T-1002."_

We didn't implement a `delete_ticket` tool. The LLM will report that no such capability exists — showing that the MCP boundary is a **safety guarantee**: the model can only do what you exposed.

### AI prompt for this step (meta)

> _"Give me 4 progressively-harder natural-language questions I can ask an LLM to demonstrate multi-step tool orchestration against a support-tickets MCP server that exposes `list_tickets`, `get_ticket`, `search_tickets`, `list_customers`, `get_customer`, `create_ticket`, `update_ticket_status`."_

---

## Part 10 — Beyond tools: Resources & Prompts (bonus)

Once the audience "gets" tools, extend the mental model:

### Resources — read-only, addressable data

Where a tool is a *function call*, a **resource** is a *file*. The client can list and read them by URI.

```ts
server.registerResource(
  "open-tickets",
  "tickets://open",
  { title: "Open Tickets", description: "All currently open tickets", mimeType: "application/json" },
  async (uri) => ({
    contents: [{
      uri: uri.href,
      mimeType: "application/json",
      text: JSON.stringify(listTickets({ status: "open" }), null, 2),
    }],
  }),
);
```

**When to use:** exposing documents, config files, dashboards, or "always-fresh" datasets the client can attach as context.

### Prompts — reusable prompt templates

A **prompt** is a named, parameterised message template the *user* can invoke (usually via a slash command in the client).

```ts
server.registerPrompt(
  "draft_ticket_reply",
  {
    title: "Draft ticket reply",
    description: "Compose a professional reply to a customer ticket",
    argsSchema: { ticketId: z.string() },
  },
  async ({ ticketId }) => {
    const t = getTicket(ticketId);
    return {
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: `Draft a polite, empathetic reply to the following support ticket:\n\n${JSON.stringify(t, null, 2)}`,
        },
      }],
    };
  },
);
```

**When to use:** codify best-practice prompts so users don't have to hand-write them each time.

### AI prompt for this step

> _"Add a `open-tickets` MCP resource at URI `tickets://open` returning JSON of all open tickets, and a `draft_ticket_reply(ticketId)` MCP prompt that fetches the ticket and asks the LLM to compose an empathetic reply. Use `server.registerResource` and `server.registerPrompt` from `@modelcontextprotocol/sdk`."_

---

## Troubleshooting

| Symptom                                                  | Fix                                                                                              |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Client shows 0 tools after connecting                    | You wrote to `stdout` (e.g. `console.log`). Move all logs to `console.error`.                    |
| `npm install` fails with `EACCES` / network error        | Corporate firewall/proxy or antivirus. Configure `npm config set proxy …` or add an exception.   |
| Claude Desktop doesn't see the server                    | Use **absolute** paths in `claude_desktop_config.json`; escape backslashes on Windows (`\\`).    |
| "Cannot find module … tools.js"                          | Missing `.js` extension in imports — required by `NodeNext` ESM. `import ... from "./tools.js"`. |
| Inspector connects but tools throw "invalid input"       | Your Zod schema doesn't match the payload. Compare against the schema in Inspector's UI.         |
| Model invents tool calls that don't exist                | Improve tool `description` and Zod `.describe()` hints — the model relies on them.               |

---

## What next?

- **Real backend**: swap `data.ts` for calls to your enterprise REST/GraphQL API.
- **Auth**: MCP supports OAuth for HTTP transports — needed for multi-user hosted servers.
- **Streamable HTTP transport**: for hosted / remote MCP servers instead of local stdio.
- **Publish**: package as an npm CLI so others can install with `npx your-mcp-server`.
- **Registry**: submit to the [MCP servers list](https://github.com/modelcontextprotocol/servers) once production-ready.

---

**Recap slide for trainers:**

> We built an MCP server in ~150 lines of TypeScript that lets *any* MCP-compatible LLM securely list, search, create, and update support tickets in our backend — no per-vendor glue code, no bespoke function-calling schemas, no direct database credentials handed to the model. That is the "USB-C for AI" promise, delivered.
