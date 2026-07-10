import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");

function randomCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function generate(phone: string): Promise<string> {
  const code = randomCode();
  await redis.set(`otp:${phone}`, code, "EX", 60);
  return code;
}

async function verify(phone: string, code: string): Promise<"ok" | "wrong" | "expired"> {
  const stored = await redis.get(`otp:${phone}`);
  if (stored === null) return "expired";
  if (stored !== code) return "wrong";
  await redis.del(`otp:${phone}`);
  return "ok";
}

async function main() {
  const phone = "9876543210";

  const code = await generate(phone);
  console.log("issued code:", code);

  console.log("wrong code   ->", await verify(phone, "000000")); // wrong
  console.log("right code   ->", await verify(phone, code));     // ok
  console.log("reuse (gone) ->", await verify(phone, code));     // expired

  // Prove TTL branch — issue and immediately overwrite with 1s TTL
  await redis.set(`otp:${phone}`, "123456", "EX", 1);
  await new Promise((r) => setTimeout(r, 1500));
  console.log("after TTL    ->", await verify(phone, "123456")); // expired

  await redis.quit();
}

main().catch(console.error);
