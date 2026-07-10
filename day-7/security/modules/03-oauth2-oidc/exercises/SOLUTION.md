# Solutions — Module 3

## Ex 2 — Why does `state` matter?

Without `state`, an attacker can trick you into completing **their** login on your machine (CSRF on the OAuth callback), or trick a victim into accepting a code that logs them in as the attacker (session fixation).

Sketch:

1. Attacker starts an OAuth flow, gets Google's `authorize` URL for the attacker's account.
2. Attacker sends the victim a link to the **callback** URL with the attacker's `code`.
3. Victim's browser hits `/auth/google/callback?code=<attackers>` while already having a session cookie with the app.
4. The app exchanges the code, logs the victim in as the **attacker's** Google identity.
5. Now the victim uploads their data to what they think is their account — but it's actually the attacker's account (or vice versa: attacker sees the victim's data via the attacker-controlled Google account).

`state` fixes this: the app sets `state=<random>` in the session at `/start`. On `/callback`, the request must present the same value. A cross-site attacker cannot know the victim's session `state`.

## Ex 3 — Bridge to your own JWT

```ts
import jwt from 'jsonwebtoken';

const APP_SECRET = process.env.APP_SECRET!;
const users = new Map<string, { id: string; email: string; name: string; role: 'user'|'admin' }>();

function findOrCreateUser(input: { googleSub: string; email: string; name?: string }) {
  const existing = users.get(input.googleSub);
  if (existing) return existing;
  const user = { id: input.googleSub, email: input.email, name: input.name ?? '', role: 'user' as const };
  users.set(input.googleSub, user);
  return user;
}

// inside /auth/google/callback:
const claims = tokenSet.claims();
const user = findOrCreateUser({
  googleSub: String(claims.sub),
  email: String(claims.email),
  name: claims.name as string | undefined,
});
const appToken = jwt.sign({ sub: user.id, role: user.role }, APP_SECRET, {
  algorithm: 'HS256',
  issuer: 'notes-api',
  audience: 'notes-web',
  expiresIn: '15m',
});
res.cookie('access_token', appToken, {
  httpOnly: true,
  sameSite: 'lax',
  secure: false, // true in prod
  maxAge: 15 * 60 * 1000,
});
res.redirect('/');
```

Now the Notes API doesn't care where users came from — Google, email/password, whatever — because they all present the same app-issued JWT.
