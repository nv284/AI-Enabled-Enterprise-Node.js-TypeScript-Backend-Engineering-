import { redis, K, today } from "./redis";

export type Analytics = {
  code: string;
  total: number;
  last7Days: Array<{ day: string; count: number }>;
};

/**
 * Last-N-days click counts.
 * Uses MGET so it's a single Redis round-trip for the whole window.
 */
export async function getAnalytics(code: string, days = 7): Promise<Analytics> {
  const dayKeys: string[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(now.getUTCDate() - i);
    const day = d.toISOString().slice(0, 10);
    dayKeys.push(day);
  }

  const [totalRaw, ...perDay] = await redis.mget(
    K.clicksTotal(code),
    ...dayKeys.map((d) => K.clicksByDay(code, d)),
  );

  return {
    code,
    total: Number(totalRaw ?? 0),
    last7Days: dayKeys.map((day, i) => ({
      day,
      count: Number(perDay[i] ?? 0),
    })),
  };
}
