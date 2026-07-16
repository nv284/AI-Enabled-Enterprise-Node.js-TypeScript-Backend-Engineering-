// modules/06-capstone-data-analyst/src/mockLlm.ts
//
// Pattern-matching reasoner supporting BOTH sales.csv and products.csv.

import type { Decision, Reasoner, Step } from "./types.ts";

/*-------------------------------------------------------
  Supported Columns
-------------------------------------------------------*/

const NUMERIC_COLUMNS = [
  "units",
  "revenue",
  "price",
  "stock",
  "rating",
];

const CATEGORICAL_COLUMNS = [
  "region",
  "product",
  "date",
  "brand",
  "category",
  "supplier",
  "productname",
];

/*-------------------------------------------------------
  Dataset Selector
-------------------------------------------------------*/

function chooseDataset(goal: string): string {
  const g = goal.toLowerCase();
  const numCol = firstNumericMentioned(g);
  console.log("Goal :", g);
  console.log("Numeric Column :", numCol);

  const productKeywords = [
    "price",
    "stock",
    "brand",
    "category",
    "supplier",
    "rating",
    "laptop",
    "mobile",
    "phone",
    "watch",
    "headphone",
    "camera",
    "printer",
    "keyboard",
    "mouse",
    "router",
    "storage",
    "apple",
    "dell",
    "lenovo",
    "samsung",
    "sony",
    "boat",
    "canon",
    "nikon",
    "hp",
    "epson",
    "logitech",
    "keychron",
    "tp-link",
    "seagate",
  ];

  if (productKeywords.some((k) => g.includes(k))) {
    return "data/products.csv";
  }

  return "data/sales.csv";
}

/*-------------------------------------------------------
  Helper Functions
-------------------------------------------------------*/

function isErr(o: unknown): o is { error: string } | { blocked: string } {
  return !!o && typeof o === "object" && ("error" in (o as object) || "blocked" in (o as object));
}

function goodObs(history: Step[], name: string): unknown | undefined {
  return history.find((s) => s.action.tool === name && !isErr(s.observation))?.observation;
}

function has(g: string, ...w: string[]): boolean {
  const s = g.toLowerCase();
  return w.every((x) => s.includes(x));
}

function firstNumericMentioned(g: string): string | undefined {
  const s = g.toLowerCase();
  return NUMERIC_COLUMNS.find((c) => s.includes(c));
}

function firstCategoricalMentioned(g: string): string | undefined {
  const s = g.toLowerCase();
  return CATEGORICAL_COLUMNS.find((c) => s.includes(c));
}

/*-------------------------------------------------------
  Main Reasoner
-------------------------------------------------------*/

export const mockLlm: Reasoner = ({ goal, history }) => {
  const last = history[history.length - 1];

  if (last && isErr(last.observation)) {
    return end(
      `I hit an issue on the previous step: ${JSON.stringify(last.observation)}`
    );
  }

  const dataset = chooseDataset(goal);

  /*--------------------------
      Load CSV
  --------------------------*/

  if (!goodObs(history, "loadCsv")) {
    return step("No data loaded. Load the appropriate dataset.", {
      tool: "loadCsv",
      args: {
        path: dataset,
      },
    });
  }

  const g = goal.toLowerCase();

  const wantsChart =
    has(g, "chart") ||
    has(g, "plot") ||
    has(g, "bar");

  const numCol = firstNumericMentioned(g);

  const catCol = firstCategoricalMentioned(g);

  /*--------------------------
      Row Count
  --------------------------*/

  if (
    has(g, "how many", "row") ||
    has(g, "count", "row") ||
    has(g, "number", "row")
  ) {
    const c = goodObs(history, "aggregate");

    if (c === undefined) {
      return step("Count rows.", {
        tool: "aggregate",
        args: {
          column: numCol ?? "revenue",
          op: "count",
        },
      });
    }

    return end(`Row count: ${c}`);
  }

  /*--------------------------
      Chart
  --------------------------*/

  if (wantsChart && numCol && catCol) {
    const grouped = goodObs(history, "groupBy") as
      | Record<string, number>
      | undefined;

    if (!grouped) {
      return step(
        `Group '${numCol}' by '${catCol}' before chart.`,
        {
          tool: "groupBy",
          args: {
            groupColumn: catCol,
            valueColumn: numCol,
            op: "sum",
          },
        }
      );
    }

    const rendered = goodObs(history, "chart") as string | undefined;

    if (!rendered) {
      return step("Render chart.", {
        tool: "chart",
        args: {
          data: grouped,
          title: `${numCol} by ${catCol}`,
        },
      });
    }

    return end(`\n${rendered}`);
  }

  /*--------------------------
      Group By
  --------------------------*/

  if (numCol && catCol) {
    const grouped = goodObs(history, "groupBy");

    if (!grouped) {
      return step(
        `Group '${numCol}' by '${catCol}'.`,
        {
          tool: "groupBy",
          args: {
            groupColumn: catCol,
            valueColumn: numCol,
            op: "sum",
          },
        }
      );
    }

    return end(
      `${numCol} by ${catCol}: ${JSON.stringify(grouped)}`
    );
  }

  /*--------------------------
      Sum
  --------------------------*/

  if ((has(g, "total") || has(g, "sum")) && numCol) {
    const total = goodObs(history, "aggregate");

    if (total === undefined) {
      return step(
        `Calculate total ${numCol}.`,
        {
          tool: "aggregate",
          args: {
            column: numCol,
            op: "sum",
          },
        }
      );
    }

    return end(`Total ${numCol}: ${total}`);
  }

  /*--------------------------
      Average
  --------------------------*/

  if (
    (has(g, "average") ||
      has(g, "avg") ||
      has(g, "mean")) &&
    numCol
  ) {
    const avg = goodObs(history, "aggregate") as
      | number
      | undefined;

    if (avg === undefined) {
      return step(
        `Calculate average ${numCol}.`,
        {
          tool: "aggregate",
          args: {
            column: numCol,
            op: "avg",
          },
        }
      );
    }

    return end(`Average ${numCol}: ${avg.toFixed(2)}`);
  }

  /*--------------------------
      Unknown Question
  --------------------------*/

  return end(
    `I loaded ${dataset} successfully, but I don't yet know how to answer: "${goal}".`
  );
};

/*-------------------------------------------------------
  Utilities
-------------------------------------------------------*/

function step(
  thought: string,
  action: Decision["action"]
): Decision {
  return {
    thought,
    action,
  };
}

function end(message: string): Decision {
  return {
    thought: "Enough information collected.",
    action: {
      tool: "final",
      args: {
        message,
      },
    },
  };
}