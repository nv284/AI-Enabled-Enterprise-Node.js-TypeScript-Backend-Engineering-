// modules/06-capstone-data-analyst/src/types.ts
export type Action =
  | { tool: string; args: Record<string, unknown> }
  | { tool: "final"; args: { message: string } };

export interface Decision { thought: string; action: Action; }

export interface Step {
  thought: string;
  action: Action;
  observation: unknown;
}

export interface ReasonerState {
  goal: string;
  history: Step[];
  catalog: string;
}

export type Reasoner = (state: ReasonerState) => Decision;

export interface Tool<A = Record<string, unknown>, R = unknown> {
  readonly name: string;
  readonly description: string;
  readonly argsSchema: string;
  run(args: A): Promise<R> | R;
}

export type ToolRegistry = Record<string, Tool>;
