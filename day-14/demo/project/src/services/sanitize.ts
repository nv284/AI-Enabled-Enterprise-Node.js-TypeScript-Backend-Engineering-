/**
 * Defensive helpers for cleaning LLM output.
 *
 * Even with a perfect prompt, a real model occasionally wraps code in markdown
 * fences or adds stray whitespace. We NEVER trust raw model output blindly —
 * we normalize it before returning it to callers. (Module 2: "parse defensively".)
 */

/** Strip a leading/trailing ```lang ... ``` fence if the model added one. */
export function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```[a-zA-Z]*\n([\s\S]*?)\n?```$/);
  return (fenced ? fenced[1] : trimmed).trim();
}
