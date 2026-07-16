// modules/03-reasoning/src/types.ts
//
// Types that every subsequent module reuses. Read them once, refer often.

export type Action =
  | { tool: string; args: Record<string, unknown> }
  | { tool: "final"; args: { message: string } };

export interface Decision {
  thought: string;
  action: Action;
}

/** One completed turn of the loop. */
export interface Step {
  thought: string;
  action: Action;
  observation: unknown; // whatever the tool returned (or an error)
}

export interface ReasonerState {
  goal: string;
  history: Step[];
  catalog: string;
}

export type Reasoner = (state: ReasonerState) => Decision;
