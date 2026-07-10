/**
 * Example 4 — the classic "alg: none" attack, and how to block it.
 *
 * Some old JWT libraries would accept a token whose header says {"alg":"none"}
 * and no signature — treating it as valid because "none" means "no signature".
 * `jsonwebtoken` v9+ rejects this by default, but only if you pass
 * `algorithms` to verify(). If you forget, and use an older lib, you get owned.
 *
 * Run: npx tsx 04-attack-alg-none.ts
 */
import jwt from 'jsonwebtoken';

const SECRET = 'super-secret-training-key-change-me';

// 1. Attacker crafts a token with alg=none and no signature.
const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
const payload = Buffer.from(JSON.stringify({ sub: '42', role: 'admin' })).toString('base64url');
const evilToken = `${header}.${payload}.`; // empty signature

console.log('Evil token:', evilToken, '\n');

// 2. WRONG — no `algorithms` option means the lib may try to guess.
try {
  const claims = jwt.verify(evilToken, SECRET);
  console.log('DANGER: accepted', claims);
} catch (err) {
  console.log('Rejected (default protection):', (err as Error).message);
}

// 3. RIGHT — always whitelist algorithms explicitly.
try {
  jwt.verify(evilToken, SECRET, { algorithms: ['HS256'] });
  console.log('DANGER: accepted with whitelist!');
} catch (err) {
  console.log('Rejected with whitelist:', (err as Error).message);
}

// Lesson: `jwt.verify(token, key, { algorithms: [...] })` is not optional.
