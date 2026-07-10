import { config } from "./config";

/**
 * Source-of-truth "DB". In the real world this is Postgres/MySQL/etc.
 * We use an in-memory Map with simulated latency so the whole module
 * runs with just Redis and Node — nothing else to install.
 */
export type UrlRecord = {
  code: string;
  target: string;
  owner: string;
  createdAt: string;
};

const store = new Map<string, UrlRecord>();

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function dbInsert(rec: UrlRecord): Promise<void> {
  await sleep(config.dbLatencyMs);
  if (store.has(rec.code)) throw new Error("code_collision");
  store.set(rec.code, rec);
}

export async function dbGet(code: string): Promise<UrlRecord | null> {
  await sleep(config.dbLatencyMs);
  return store.get(code) ?? null;
}

export async function dbDelete(code: string): Promise<boolean> {
  await sleep(config.dbLatencyMs);
  return store.delete(code);
}

export async function dbCount(): Promise<number> {
  return store.size;
}
