import { createHash, randomBytes } from 'node:crypto';
import { db } from './db.js';

const EMAIL_TOKEN_TTL = {
  verify_email: 24 * 60 * 60 * 1000,
  reset_password: 60 * 60 * 1000,
};

export class EmailDeliveryUnavailableError extends Error {
  constructor() {
    super('Email delivery is not configured. Please contact the app owner.');
    this.name = 'EmailDeliveryUnavailableError';
    this.statusCode = 503;
  }
}

export class EmailDeliveryError extends Error {
  constructor() {
    super('The email could not be sent. Please try again later.');
    this.name = 'EmailDeliveryError';
    this.statusCode = 502;
  }
}

export function createEmailToken(userId, purpose) {
  const ttl = EMAIL_TOKEN_TTL[purpose];
  if (!ttl) throw new Error('Unsupported email-token purpose.');

  const token = randomBytes(32).toString('base64url');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const now = new Date().toISOString();
  db.prepare('DELETE FROM email_tokens WHERE user_id = ? AND purpose = ?').run(
    userId,
    purpose
  );
  db.prepare(
    `INSERT INTO email_tokens (token_hash, user_id, purpose, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?)`
  ).run(tokenHash, userId, purpose, Date.now() + ttl, now);
  return token;
}

export function findEmailToken(token, purpose) {
  if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{40,60}$/.test(token)) {
    return null;
  }
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const row = db
    .prepare(
      `SELECT token_hash, user_id, expires_at
       FROM email_tokens
       WHERE token_hash = ? AND purpose = ?`
    )
    .get(tokenHash, purpose);
  if (!row) return null;
  if (row.expires_at <= Date.now()) {
    db.prepare('DELETE FROM email_tokens WHERE token_hash = ?').run(tokenHash);
    return null;
  }
  return row;
}

export function deleteEmailTokens(userId, purpose) {
  db.prepare('DELETE FROM email_tokens WHERE user_id = ? AND purpose = ?').run(
    userId,
    purpose
  );
}

export function emailActionUrl(path, token) {
  const appOrigin = process.env.APP_ORIGIN;
  if (!appOrigin) throw new EmailDeliveryUnavailableError();

  let url;
  try {
    url = new URL(path, appOrigin);
  } catch {
    throw new EmailDeliveryUnavailableError();
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new EmailDeliveryUnavailableError();
  }
  url.searchParams.set('token', token);
  return url.toString();
}

export async function sendEmail({ to, subject, html, headers = {} }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from || !process.env.APP_ORIGIN) {
    throw new EmailDeliveryUnavailableError();
  }

  let endpoint;
  try {
    endpoint = new URL(
      process.env.RESEND_API_URL || 'https://api.resend.com/emails'
    );
  } catch {
    throw new EmailDeliveryUnavailableError();
  }
  if (!['http:', 'https:'].includes(endpoint.protocol)) {
    throw new EmailDeliveryUnavailableError();
  }

  let response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: [to], subject, html, headers }),
    });
    await response.arrayBuffer();
  } catch {
    throw new EmailDeliveryError();
  }

  if (!response.ok) throw new EmailDeliveryError();
}
