import { test } from "node:test";
import assert from "node:assert/strict";
import { createShortUrl, resolveCode } from "../src/shortener";
import { redis } from "../src/redis";

test("create + resolve round-trip", async () => {
  const rec = await createShortUrl("https://example.com/", "test-user");
  assert.match(rec.code, /^[0-9A-Za-z]{7}$/);

  const target = await resolveCode(rec.code);
  assert.equal(target, "https://example.com/");
});

test("missing code returns null and negatively caches", async () => {
  const target = await resolveCode("does-not-exist-1234567");
  assert.equal(target, null);

  // second call should hit the negative cache (no way to prove without mocking DB,
  // but at least assert it stays null)
  const target2 = await resolveCode("does-not-exist-1234567");
  assert.equal(target2, null);
});

test("bad target is rejected", async () => {
  await assert.rejects(
    () => createShortUrl("ftp://example.com", "test-user"),
    /bad_target/,
  );
});

test.after(async () => {
  await redis.quit();
});
