import { BaseClient, Issuer } from 'openid-client';
import { env } from '../config/env.js';

let clientPromise: Promise<BaseClient> | null = null;

export function googleClient(): Promise<BaseClient> {
  if (!env.googleEnabled) {
    return Promise.reject(new Error('Google OAuth not configured. Set GOOGLE_CLIENT_ID/SECRET in .env.'));
  }
  if (!clientPromise) {
    clientPromise = Issuer.discover('https://accounts.google.com').then(
      (google) =>
        new google.Client({
          client_id: env.GOOGLE_CLIENT_ID,
          client_secret: env.GOOGLE_CLIENT_SECRET,
          redirect_uris: [env.GOOGLE_REDIRECT_URI],
          response_types: ['code'],
        })
    );
  }
  return clientPromise;
}
