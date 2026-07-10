import argon2 from 'argon2';

// Pre-computed dummy hash used on "user not found" to keep timing similar.
// Computed lazily on first use so tests don't pay the cost on import.
let dummyHashPromise: Promise<string> | null = null;
function getDummyHash() {
  if (!dummyHashPromise) dummyHashPromise = hashPassword('this-is-a-dummy-so-timing-is-similar');
  return dummyHashPromise;
}

export function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, {
    type: argon2.argon2id,
    memoryCost: 19_456,
    timeCost: 2,
    parallelism: 1,
  });
}

export async function verifyPassword(plain: string, stored: string | null | undefined): Promise<boolean> {
  const hash = stored ?? (await getDummyHash());
  try {
    const ok = await argon2.verify(hash, plain);
    return ok && stored != null;
  } catch {
    return false;
  }
}
