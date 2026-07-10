# Module 3 — Exercises

## Ex 1 — Get Google Sign-In working (30 min)

1. Complete SETUP.md § "Google Cloud project for OAuth" if you haven't.
2. `cd modules/03-oauth2-oidc/examples`
3. `cp .env.example .env` and paste your Google credentials.
4. `npm install`
5. `npx tsx 01-google-oidc.ts`
6. Open http://localhost:3000 → click **Sign in with Google** → after consent you should see your name and email.

**Debug tips:**
- `redirect_uri_mismatch` → the URI in Google Console must be **exactly** `http://localhost:3000/auth/google/callback`.
- `invalid_client` → wrong client secret.
- Stuck on Google consent screen → make sure your Google account is added under **Test users** in the OAuth consent screen configuration.

## Ex 2 — What if we drop `state`? (15 min)

1. In `01-google-oidc.ts`, comment out the two lines that set and check `state`.
2. Restart, sign in again — it still "works".
3. Discuss (in pairs): what class of attack does `state` prevent? Sketch the malicious sequence on paper.
4. **Answer at the bottom of SOLUTION.md.** Restore the `state` check before moving on.

## Ex 3 — Bridge OIDC → your own JWT (30 min)

Right now the demo stores the Google claims in a session cookie. In our project we want to mint our **own** JWT so the same token works with our Notes API.

Extend the callback:

1. After `client.callback(...)`, `findOrCreateUser({ googleSub, email, name })` — in-memory Map is fine.
2. Mint an app JWT: `jwt.sign({ sub: user.id, role: user.role }, APP_SECRET, { algorithm:'HS256', expiresIn:'15m' })`.
3. Set it as an `httpOnly; SameSite=Lax` cookie, or return it in JSON if you're consuming from an SPA.
4. Test: call `GET /me` with a `Bearer` header of the returned token; you should see your app user.

## Ex 4 (stretch) — Verify the ID token yourself (30 min)

Skip `openid-client`'s automatic verification. Use `jose`:

```
npm i jose
```

```ts
import { jwtVerify, createRemoteJWKSet } from 'jose';
const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
const { payload } = await jwtVerify(idToken, JWKS, {
  issuer: 'https://accounts.google.com',
  audience: GOOGLE_CLIENT_ID,
});
```

Check that a tampered token is rejected. Check that an unsigned token is rejected. Change the `audience` and observe rejection.
