/**
 * Fire N requests as fast as possible at a URL and count 200s vs 429s.
 * Usage:  npx ts-node src/hammer.ts http://localhost:3003/fixed 20
 */
async function main() {
  const url = process.argv[2] ?? "http://localhost:3003/fixed";
  const n = Number(process.argv[3] ?? 20);

  console.log(`Firing ${n} concurrent requests at ${url}...`);
  const t0 = Date.now();
  const results = await Promise.all(
    Array.from({ length: n }, () => fetch(url).then((r) => r.status)),
  );
  const dt = Date.now() - t0;

  const ok = results.filter((s) => s === 200).length;
  const limited = results.filter((s) => s === 429).length;
  const other = results.length - ok - limited;

  console.log(`in ${dt} ms:  200=${ok}   429=${limited}   other=${other}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
