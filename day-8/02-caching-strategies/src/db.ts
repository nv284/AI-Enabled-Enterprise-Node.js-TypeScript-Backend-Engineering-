/**
 * A pretend "slow database". Every read/write sleeps for `latencyMs`
 * so the effect of a cache is visible with the naked eye.
 */
export type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
};

const store = new Map<number, Product>([
  [1, { id: 1, name: "Notebook", price: 120, stock: 50 }],
  [2, { id: 2, name: "Pen", price: 20, stock: 500 }],
  [3, { id: 3, name: "Backpack", price: 1800, stock: 12 }],
  [4, { id: 4, name: "Water bottle", price: 350, stock: 80 }],
  [5, { id: 5, name: "Headphones", price: 2200, stock: 15 }],
]);

const LATENCY_MS = Number(process.env.DB_LATENCY_MS ?? 200);

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function dbGetProduct(id: number): Promise<Product | null> {
  await sleep(LATENCY_MS);
  return store.get(id) ?? null;
}

export async function dbUpdateProduct(id: number, patch: Partial<Product>): Promise<Product | null> {
  await sleep(LATENCY_MS);
  const cur = store.get(id);
  if (!cur) return null;
  const next = { ...cur, ...patch, id };
  store.set(id, next);
  return next;
}

export async function dbListProducts(): Promise<Product[]> {
  await sleep(LATENCY_MS);
  return [...store.values()];
}
