// modules/05-reflection-and-safety/src/reflect.ts
//
// Post-execution check. Looks at a tool observation and decides whether it
// smells like a useful answer or garbage. In production this is often a
// second (small, cheap) LLM call.

export type Reflection = { ok: true } | { ok: false; issue: string };

export function reflect(observation: unknown): Reflection {
  if (observation === null || observation === undefined) {
    return { ok: false, issue: "observation is null/undefined" };
  }
  if (typeof observation === "number" && Number.isNaN(observation)) {
    return { ok: false, issue: "numeric result is NaN -- wrong column or op?" };
  }
  if (
    observation &&
    typeof observation === "object" &&
    "rows" in observation &&
    Array.isArray((observation as { rows: unknown[] }).rows) &&
    (observation as { rows: unknown[] }).rows.length === 0
  ) {
    return { ok: false, issue: "no rows returned" };
  }
  return { ok: true };
}
