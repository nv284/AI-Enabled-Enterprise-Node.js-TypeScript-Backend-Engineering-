/**
 * In-memory "backend" for the Support Tickets demo.
 * In a real system this would be a database or a call to an enterprise REST API.
 * Keeping it in-memory means the MCP server has zero external dependencies.
 */

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

export interface Customer {
  id: string;
  name: string;
  email: string;
}

export interface Ticket {
  id: string;
  customerId: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
}

const customers: Customer[] = [
  { id: "C-001", name: "Alice Johnson", email: "alice@example.com" },
  { id: "C-002", name: "Bob Smith", email: "bob@example.com" },
  { id: "C-003", name: "Carol Davis", email: "carol@example.com" },
];

const tickets: Ticket[] = [
  {
    id: "T-1001",
    customerId: "C-001",
    subject: "Cannot log in to dashboard",
    description: "Getting a 500 error after entering credentials.",
    status: "open",
    priority: "high",
    createdAt: "2026-07-01T09:15:00Z",
    updatedAt: "2026-07-01T09:15:00Z",
  },
  {
    id: "T-1002",
    customerId: "C-002",
    subject: "Feature request: dark mode",
    description: "Would love a dark theme in the mobile app.",
    status: "in_progress",
    priority: "low",
    createdAt: "2026-06-28T14:02:00Z",
    updatedAt: "2026-07-02T10:30:00Z",
  },
  {
    id: "T-1003",
    customerId: "C-001",
    subject: "Invoice charged twice",
    description: "Duplicate charge on invoice INV-8842.",
    status: "open",
    priority: "urgent",
    createdAt: "2026-07-03T11:20:00Z",
    updatedAt: "2026-07-03T11:20:00Z",
  },
  {
    id: "T-1004",
    customerId: "C-003",
    subject: "Password reset email not received",
    description: "Tried three times; no email arrives.",
    status: "resolved",
    priority: "medium",
    createdAt: "2026-06-20T08:00:00Z",
    updatedAt: "2026-06-21T09:45:00Z",
  },
];

let nextTicketNumber = 1005;

export function listTickets(filters?: {
  status?: TicketStatus;
  priority?: TicketPriority;
  customerId?: string;
}): Ticket[] {
  return tickets.filter((t) => {
    if (filters?.status && t.status !== filters.status) return false;
    if (filters?.priority && t.priority !== filters.priority) return false;
    if (filters?.customerId && t.customerId !== filters.customerId) return false;
    return true;
  });
}

export function getTicket(id: string): Ticket | undefined {
  return tickets.find((t) => t.id === id);
}

export function searchTickets(query: string): Ticket[] {
  const q = query.toLowerCase();
  return tickets.filter(
    (t) =>
      t.subject.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q),
  );
}

export function createTicket(input: {
  customerId: string;
  subject: string;
  description: string;
  priority: TicketPriority;
}): Ticket {
  if (!customers.some((c) => c.id === input.customerId)) {
    throw new Error(`Unknown customerId: ${input.customerId}`);
  }
  const now = new Date().toISOString();
  const ticket: Ticket = {
    id: `T-${nextTicketNumber++}`,
    customerId: input.customerId,
    subject: input.subject,
    description: input.description,
    status: "open",
    priority: input.priority,
    createdAt: now,
    updatedAt: now,
  };
  tickets.push(ticket);
  return ticket;
}

export function updateTicketStatus(id: string, status: TicketStatus): Ticket {
  const ticket = tickets.find((t) => t.id === id);
  if (!ticket) throw new Error(`Ticket not found: ${id}`);
  ticket.status = status;
  ticket.updatedAt = new Date().toISOString();
  return ticket;
}

export function listCustomers(): Customer[] {
  return [...customers];
}

export function getCustomer(id: string): Customer | undefined {
  return customers.find((c) => c.id === id);
}
