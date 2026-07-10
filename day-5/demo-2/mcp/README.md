# MCP Support Tickets Server (TypeScript)

A minimal **Model Context Protocol (MCP)** server that exposes a small "Support Tickets" backend to any MCP-compatible AI client (Claude Desktop, VS Code, MCP Inspector, custom clients, etc.).

Built for training / demo purposes. Everything runs locally with **zero external services** — the "backend" is an in-memory JSON store.

> **What is MCP?** MCP is an open protocol from Anthropic that standardises how LLMs talk to external systems. Think of it as a "USB-C port for AI": your model plugs into any MCP server and instantly gains new capabilities — reading data, calling APIs, or triggering actions in your systems.

---

## What this server exposes

Seven **tools** that the LLM can call:

| Tool                   | Type   | Purpose                                       |
| ---------------------- | ------ | --------------------------------------------- |
| `list_tickets`         | Read   | List tickets with optional filters            |
| `get_ticket`           | Read   | Fetch one ticket by id                        |
| `search_tickets`       | Read   | Full-text search across subject / description |
| `list_customers`       | Read   | List all customers                            |
| `get_customer`         | Read   | Fetch one customer by id                      |
| `create_ticket`        | Action | Create a new ticket for an existing customer  |
| `update_ticket_status` | Action | Move a ticket through its lifecycle           |

---

## Quick start

```powershell
npm install
npm run build
npm run inspect   # opens MCP Inspector in the browser
```

Then in Inspector: **Connect → List Tools → try `list_tickets` with `{ "status": "open" }`**.

---

## Project layout

```
.
├── src/
│   ├── index.ts   # bootstraps McpServer + stdio transport
│   ├── tools.ts   # registers all 7 MCP tools
│   └── data.ts    # in-memory "backend" (tickets + customers)
├── package.json
├── tsconfig.json
├── README.md
└── walkthrough.md # step-by-step training guide with AI prompts
```

For the full training walkthrough (including the AI prompts to use at each stage), see **[walkthrough.md](walkthrough.md)**.

---

## Using with Claude Desktop

Add to `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "support-tickets": {
      "command": "node",
      "args": ["C:\\absolute\\path\\to\\dist\\index.js"]
    }
  }
}
```

Restart Claude Desktop and ask: _"Show me all urgent support tickets."_

## Using with VS Code

Add to `.vscode/mcp.json` in any workspace:

```json
{
  "servers": {
    "support-tickets": {
      "type": "stdio",
      "command": "node",
      "args": ["C:\\absolute\\path\\to\\dist\\index.js"]
    }
  }
}
```

---

## License

MIT
