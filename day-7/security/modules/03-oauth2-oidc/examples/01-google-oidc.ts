/**
 * Example — Google Sign-In using OpenID Connect (Auth Code + PKCE).
 *
 * Prereq: fill .env from .env.example, npm install.
 * Run:    npx tsx 01-google-oidc.ts
 * Open:   http://localhost:3000
 */
import 'dotenv/config';
import express from 'express';
import cookieSession from 'cookie-session';
import { Issuer, generators } from 'openid-client';

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  SESSION_SECRET,
} = process.env;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI || !SESSION_SECRET) {
  throw new Error('Missing required env vars. See .env.example.');
}

async function main() {
  const google = await Issuer.discover('https://accounts.google.com');
  const client = new google.Client({
    client_id: GOOGLE_CLIENT_ID!,
    client_secret: GOOGLE_CLIENT_SECRET!,
    redirect_uris: [GOOGLE_REDIRECT_URI!],
    response_types: ['code'],
  });

  const app = express();
  app.use(cookieSession({
    name: 'sess',
    keys: [SESSION_SECRET!],
    httpOnly: true,
    sameSite: 'lax',
    secure: false, // set true behind HTTPS in prod
    maxAge: 60 * 60 * 1000,
  }));

  app.get('/', (req, res) => {
    const user = (req.session as any)?.user;
    if (user) {
      res.type('html').send(`
        <h1>Hello ${user.name} 👋</h1>
        <p>email: ${user.email}</p>
        <p><a href="/logout">logout</a></p>
      `);
    } else {
      res.type('html').send(`
        <h1>Demo</h1>
        <p><a href="/auth/google/start">Sign in with Google</a></p>
      `);
    }
  });

  app.get('/auth/google/start', (req, res) => {
    const code_verifier = generators.codeVerifier();
    const code_challenge = generators.codeChallenge(code_verifier);
    const state = generators.state();
    const nonce = generators.nonce();

    (req.session as any).pkce = { code_verifier, state, nonce };

    const url = client.authorizationUrl({
      scope: 'openid email profile',
      code_challenge,
      code_challenge_method: 'S256',
      state,
      nonce,
    });
    res.redirect(url);
  });

  app.get('/auth/google/callback', async (req, res) => {
    try {
      const params = client.callbackParams(req);
      const stored = (req.session as any)?.pkce;
      if (!stored) return res.status(400).send('missing session state');

      const tokenSet = await client.callback(GOOGLE_REDIRECT_URI!, params, {
        code_verifier: stored.code_verifier,
        state: stored.state,
        nonce: stored.nonce,
      });

      const claims = tokenSet.claims(); // signature, iss, aud, exp, nonce all verified
      // In real app: find-or-create user in DB, then mint your own session/JWT.
      (req.session as any).user = {
        sub: claims.sub,
        email: claims.email,
        name: claims.name,
        picture: claims.picture,
      };
      (req.session as any).pkce = undefined;
      res.redirect('/');
    } catch (err) {
      console.error(err);
      res.status(401).send('login failed');
    }
  });

  app.post('/logout', (req, res) => {
    req.session = null;
    res.redirect('/');
  });
  app.get('/logout', (req, res) => { req.session = null; res.redirect('/'); });

  app.listen(3000, () => console.log('http://localhost:3000'));
}

main().catch((e) => { console.error(e); process.exit(1); });
