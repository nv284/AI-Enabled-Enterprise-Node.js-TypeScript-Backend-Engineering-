import { Router } from 'express';
import cookieSession from 'cookie-session';
import { generators } from 'openid-client';
import { env } from '../config/env.js';
import { prisma } from '../db.js';
import { googleClient } from '../services/google.js';
import { issueAccessToken, issueRefreshToken } from '../services/tokens.js';

export const googleAuthRouter = Router();

// Session cookie is only used to store one-shot PKCE / state during the OAuth dance.
googleAuthRouter.use(
  cookieSession({
    name: 'oauth_sess',
    keys: [env.SESSION_SECRET],
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    maxAge: 10 * 60 * 1000, // 10 min — plenty for a login flow
  })
);

googleAuthRouter.get('/start', async (req, res, next) => {
  try {
    const client = await googleClient();
    const code_verifier = generators.codeVerifier();
    const code_challenge = generators.codeChallenge(code_verifier);
    const state = generators.state();
    const nonce = generators.nonce();

    (req.session as { pkce?: unknown }).pkce = { code_verifier, state, nonce };

    const url = client.authorizationUrl({
      scope: 'openid email profile',
      code_challenge,
      code_challenge_method: 'S256',
      state,
      nonce,
    });
    res.redirect(url);
  } catch (e) {
    next(e);
  }
});

googleAuthRouter.get('/callback', async (req, res, next) => {
  try {
    const client = await googleClient();
    const params = client.callbackParams(req);
    const stored = (req.session as { pkce?: { code_verifier: string; state: string; nonce: string } })?.pkce;
    if (!stored) return res.status(400).json({ error: 'session_missing' });

    const tokenSet = await client.callback(env.GOOGLE_REDIRECT_URI, params, {
      code_verifier: stored.code_verifier,
      state: stored.state,
      nonce: stored.nonce,
    });
    const claims = tokenSet.claims();

    if (!claims.sub || !claims.email) {
      return res.status(400).json({ error: 'invalid_id_token' });
    }

    // Find-or-create user by Google sub.
    const user = await prisma.user.upsert({
      where: { googleSub: claims.sub },
      update: {},
      create: {
        email: String(claims.email),
        name: (claims.name as string | undefined) ?? null,
        googleSub: claims.sub,
        role: 'user',
      },
    });

    // Issue our own app tokens; downstream doesn't care where user came from.
    const accessToken = issueAccessToken(user.id, user.role);
    const { raw: refreshToken } = await issueRefreshToken(user.id);
    req.session = null; // clear PKCE cookie

    res.json({ accessToken, refreshToken, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (e) {
    next(e);
  }
});
