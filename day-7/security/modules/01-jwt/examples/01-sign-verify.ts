/**
 * Example 1 — sign and verify a JWT.
 *
 * Run: npx tsx 01-sign-verify.ts
 */
import jwt from 'jsonwebtoken';

// In real code, load from process.env and require >= 32 random bytes.
const SECRET = 'super-secret-training-key-change-me';

// 1. Sign
const token = jwt.sign(
  { sub: '42', role: 'user', email: 'ada@example.com' },
  SECRET,
  {
    algorithm: 'HS256',
    issuer: 'notes-api',
    audience: 'notes-web',
    expiresIn: '15m',
  }
);
console.log('Token:\n', token, '\n');

// 2. Decode WITHOUT verifying (never trust this in production)
const decoded = jwt.decode(token, { complete: true });
console.log('Decoded (unverified):', decoded, '\n');

// 3. Verify — always whitelist algorithms and pin iss/aud
try {
  const claims = jwt.verify(token, SECRET, {
    algorithms: ['HS256'],
    issuer: 'notes-api',
    audience: 'notes-web',
  });
  console.log('Verified claims:', claims);
} catch (err) {
  console.error('Verification failed:', (err as Error).message);
}

// 4. Tamper — flip one character in the payload segment and re-verify
const [h, p, s] = token.split('.');
const tamperedPayload = p.replace(/.$/, (c) => (c === 'A' ? 'B' : 'A'));
const tampered = [h, tamperedPayload, s].join('.');
try {
  jwt.verify(tampered, SECRET, { algorithms: ['HS256'] });
} catch (err) {
  console.log('\nTampered token rejected as expected:', (err as Error).message);
}
