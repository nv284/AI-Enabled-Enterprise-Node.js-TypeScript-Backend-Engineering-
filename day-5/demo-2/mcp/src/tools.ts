import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  createTicket,
  getCustomer,
  getTicket,
  listCustomers,
  listTickets,
  searchTickets,
  updateTicketStatus,
} from "./data.js";

/**
 * Register all Support Tickets tools on the given MCP server.
 *
 * Each tool = one capability the LLM can invoke. The `inputSchema` (Zod)
 * is sent to the model so it knows exactly what arguments to produce.
 */
export function registerTools(server: McpServer): void {
  // ---- Read tools -----------------------------------------------------------

  server.registerTool(
    "list_tickets",
    {
      title: "List Tickets",
      description:
        "List support tickets, optionally filtered by status, priority, or customer.",
      inputSchema: {
        status: z
          .enum(["open", "in_progress", "resolved", "closed"])
          .optional()
          .describe("Filter by ticket status"),
        priority: z
          .enum(["low", "medium", "high", "urgent"])
          .optional()
          .describe("Filter by priority"),
        customerId: z
          .string()
          .optional()
          .describe("Filter by customer id (e.g. C-001)"),
      },
    },
    async ({ status, priority, customerId }) => {
      const results = listTickets({ status, priority, customerId });
      return {
        content: [
          {
            type: "text",
            text:
              results.length === 0
                ? "No tickets match those filters."
                : JSON.stringify(results, null, 2),
          },
        ],
      };
    },
  );

  server.registerTool(
    "get_ticket",
    {
      title: "Get Ticket",
      description: "Fetch the full details of a single ticket by its id.",
      inputSchema: {
        id: z.string().describe("Ticket id, e.g. T-1001"),
      },
    },
    async ({ id }) => {
      const ticket = getTicket(id);
      if (!ticket) {
        return {
          isError: true,
          content: [{ type: "text", text: `Ticket ${id} not found.` }],
        };
      }
      return {
        content: [{ type: "text", text: JSON.stringify(ticket, null, 2) }],
      };
    },
  );

  server.registerTool(
    "search_tickets",
    {
      title: "Search Tickets",
      description:
        "Full-text search across ticket subject and description. Use for natural-language queries like 'login problems' or 'billing'.",
      inputSchema: {
        query: z.string().min(1).describe("Free-text search query"),
      },
    },
    async ({ query }) => {
      const results = searchTickets(query);
      return {
        content: [
          {
            type: "text",
            text:
              results.length === 0
                ? `No tickets matched "${query}".`
                : JSON.stringify(results, null, 2),
          },
        ],
      };
    },
  );

  server.registerTool(
    "list_customers",
    {
      title: "List Customers",
      description: "Return all known customers.",
      inputSchema: {},
    },
    async () => ({
      content: [
        { type: "text", text: JSON.stringify(listCustomers(), null, 2) },
      ],
    }),
  );

  server.registerTool(
    "get_customer",
    {
      title: "Get Customer",
      description: "Fetch a single customer by id.",
      inputSchema: {
        id: z.string().describe("Customer id, e.g. C-001"),
      },
    },
    async ({ id }) => {
      const customer = getCustomer(id);
      if (!customer) {
        return {
          isError: true,
          content: [{ type: "text", text: `Customer ${id} not found.` }],
        };
      }
      return {
        content: [{ type: "text", text: JSON.stringify(customer, null, 2) }],
      };
    },
  );

  // ---- Write tools (actions) ------------------------------------------------

  server.registerTool(
    "create_ticket",
    {
      title: "Create Ticket",
      description:
        "Create a new support ticket for an existing customer. Returns the created ticket.",
      inputSchema: {
        customerId: z.string().describe("Existing customer id, e.g. C-001"),
        subject: z.string().min(3).describe("Short subject line"),
        description: z.string().min(3).describe("Detailed description"),
        priority: z
          .enum(["low", "medium", "high", "urgent"])
          .describe("Ticket priority"),
      },
    },
    async (input) => {
      try {
        const ticket = createTicket(input);
        return {
          content: [
            {
              type: "text",
              text: `Created ticket ${ticket.id}:\n${JSON.stringify(ticket, null, 2)}`,
            },
          ],
        };
      } catch (err) {
        return {
          isError: true,
          content: [{ type: "text", text: (err as Error).message }],
        };
      }
    },
  );

  server.registerTool(
    "update_ticket_status",
    {
      title: "Update Ticket Status",
      description: "Change the status of an existing ticket.",
      inputSchema: {
        id: z.string().describe("Ticket id, e.g. T-1001"),
        status: z
          .enum(["open", "in_progress", "resolved", "closed"])
          .describe("New status"),
      },
    },
    async ({ id, status }) => {
      try {
        const ticket = updateTicketStatus(id, status);
        return {
          content: [
            {
              type: "text",
              text: `Ticket ${ticket.id} is now ${ticket.status}.`,
            },
          ],
        };
      } catch (err) {
        return {
          isError: true,
          content: [{ type: "text", text: (err as Error).message }],
        };
      }
    },
  );
}
