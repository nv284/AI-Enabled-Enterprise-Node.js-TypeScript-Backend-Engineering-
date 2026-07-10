# Module 1 — Exercises

## Ex 1 — JWT playground (10 min)

**Goal:** get your hands dirty signing and tampering.

1. Copy `../examples/01-sign-verify.ts` into a scratch file.
2. Change the payload to include a `permissions: ["read", "write"]` array.
3. Print the token. Paste it into https://jwt.io — confirm the payload is readable.
4. Flip one character in the middle segment of the token. Re-verify — it must fail.
5. **Question:** why can jwt.io read your payload without your secret?

## Ex 2 — `authGuard` middleware (25 min)

**Starter:** copy `starter/authGuard.ts` from this folder.

Implement `authGuard` so that:

- It reads `Authorization: Bearer <token>` (case-insensitive scheme).
- It verifies with **only** HS256, correct issuer, correct audience.
- On success it populates `req.user = { sub, role }` and calls `next()`.
- On any failure it returns `401 { error: "unauthorized" }` with **no leaked details**.
- **Do not** log the secret. **Do not** log the raw token.

Write a small test using `supertest` OR by hitting the server with `curl`:
- Missing header → 401.
- Wrong scheme (`Token foo`) → 401.
- Expired token → 401.
- Tampered payload → 401.
- Valid token → 200 with your user.

**Solution:** `SOLUTION.md` (peek only after 20 min).

## Ex 3 — Refresh flow (30 min)

Extend `../examples/03-refresh-flow.ts`:

1. Add a `GET /me` endpoint protected by `authGuard`.
2. Enforce **refresh token rotation reuse detection**: if a client sends a refresh token that has already been used (i.e. its hash is not in the store because it was rotated), **revoke the entire family** for that user. (Track `familyId` on each refresh token.)
3. Return meaningful HTTP codes: 401 for auth issues, 400 for missing body.

## Ex 4 (stretch) — RS256 migration (30 min)

1. Generate an RSA keypair:

    ```powershell
    openssl genrsa -out private.pem 2048
    openssl rsa -in private.pem -pubout -out public.pem
    ```

2. Sign with the private key using `algorithm: "RS256"`.
3. Verify with the public key.
4. Why is this better once you have >1 service verifying tokens?
