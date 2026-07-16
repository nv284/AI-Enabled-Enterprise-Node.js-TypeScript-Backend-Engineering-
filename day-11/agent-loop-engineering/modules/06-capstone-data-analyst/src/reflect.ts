// modules/06-capstone-data-analyst/src/reflect.ts
export type Reflection = { ok: true } | { ok: false; issue: string };

export function reflect(observation: unknown): Reflection {
  if (observation === null || observation === undefined)
    return { ok: false, issue: "observation is null/undefined" };
  if (typeof observation === "number" && Number.isNaN(observation))
    return { ok: false, issue: "numeric result is NaN" };
  if (
    observation &&
    typeof observation === "object" &&
    "rows" in observation &&
    Array.isArray((observation as { rows: unknown[] }).rows) &&
    (observation as { rows: unknown[] }).rows.length === 0
  )
    return { ok: false, issue: "no rows returned" };
  return { ok: true };
}
