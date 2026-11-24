import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { db, getPublicUser } from './db.js';

const SESSION_COOKIE = 'ikwerre_session';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

function setSessionCookie(response, token) {
  response.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_MS,
    // prevent JS from accessing cookie (XSS protection)
  });
}


function passwordHash(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

function passwordMatches(password, storedHash) {
  const [algorithm, saltHex, hashHex] = storedHash.split('$');
  if (algorithm !== 'scrypt' || !saltHex || !hashHex) return false;

  const expected = Buffer.from(hashHex, 'hex');
  const actual = scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function getCookie(request, name) {
  const cookies = request.headers.cookie || '';
  for (const pair of cookies.split(';')) {
    const separator = pair.indexOf('=');
    if (separator < 0) continue;
    if (pair.slice(0, separator).trim() === name) {
      return decodeURIComponent(pair.slice(separator + 1).trim());
    }
  }
  return null;
}

export function createSession(response, userId) {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = Date.now() + SESSION_TTL_MS;
  db.prepare(
    'INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)'
  ).run(hashToken(token), userId, expiresAt);
  db.prepare('INSERT INTO login_events (user_id, created_at) VALUES (?, ?)').run(
    userId,
    new Date().toISOString()
  );
  setSessionCookie(response, token);
}

export function destroySession(request, response) {
  const token = getCookie(request, SESSION_COOKIE);
  if (token) {
    db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(hashToken(token));
  }
  response.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

export function requireUser(request, response, next) {
  const token = getCookie(request, SESSION_COOKIE);
  if (!token) {
    response.status(401).json({ error: 'Please sign in to continue.' });
    return;
  }

  const tokenHash = hashToken(token);
  const session = db
    .prepare('SELECT user_id, expires_at FROM sessions WHERE token_hash = ?')
    .get(tokenHash);
  if (!session || session.expires_at <= Date.now()) {
    if (session) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash);
    response.clearCookie(SESSION_COOKIE, { path: '/' });
    response.status(401).json({ error: 'Your session expired. Please sign in again.' });
    return;
  }

  const user = getPublicUser(session.user_id);
  if (!user) {
    response.status(401).json({ error: 'Your account could not be found.' });
    return;
  }

  request.user = user;
  next();
}

export function findSessionUser(request) {
  const token = getCookie(request, SESSION_COOKIE);
  if (!token) return null;

  const session = db
    .prepare('SELECT user_id, expires_at FROM sessions WHERE token_hash = ?')
    .get(hashToken(token));
  if (!session || session.expires_at <= Date.now()) return null;
  return getPublicUser(session.user_id);
}

export { passwordHash, passwordMatches };
