import { randomBytes } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const defaultPath = fileURLToPath(new URL('../data/ikwerre-path.sqlite', import.meta.url));
const databasePath = resolve(process.env.DB_PATH || defaultPath);
mkdirSync(dirname(databasePath), { recursive: true });

export const db = new DatabaseSync(databasePath);

db.exec(`
  PRAGMA foreign_keys = ON;
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    auth_provider TEXT NOT NULL DEFAULT 'password',
    email_verified_at TEXT,
    created_at TEXT NOT NULL,
    is_admin INTEGER NOT NULL DEFAULT 0,
    email_reminders_enabled INTEGER NOT NULL DEFAULT 0,
    reminder_unsubscribe_token TEXT,
    last_reminder_sent_at TEXT
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);

  CREATE TABLE IF NOT EXISTS progress (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    data TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_code TEXT NOT NULL UNIQUE,
    email_token TEXT,
    status TEXT NOT NULL,
    current_period_end TEXT,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS billing_attempts (
    reference TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS login_events (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS login_events_user_date_idx
    ON login_events(user_id, created_at);

  CREATE TABLE IF NOT EXISTS email_tokens (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    purpose TEXT NOT NULL CHECK (purpose IN ('verify_email', 'reset_password')),
    expires_at INTEGER NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS email_tokens_user_purpose_idx
    ON email_tokens(user_id, purpose);
`);

const userColumns = new Set(
  db.prepare('PRAGMA table_info(users)').all().map((column) => column.name)
);
if (!userColumns.has('email_verified_at')) {
  db.exec('ALTER TABLE users ADD COLUMN email_verified_at TEXT');
  db.exec('UPDATE users SET email_verified_at = created_at WHERE email_verified_at IS NULL');
}
const userColumnMigrations = [
  ['is_admin', 'INTEGER NOT NULL DEFAULT 0'],
  ['auth_provider', "TEXT NOT NULL DEFAULT 'password'"],
  ['email_reminders_enabled', 'INTEGER NOT NULL DEFAULT 0'],
  ['reminder_unsubscribe_token', 'TEXT'],
  ['last_reminder_sent_at', 'TEXT'],
];
for (const [name, definition] of userColumnMigrations) {
  if (!userColumns.has(name)) {
    db.exec(`ALTER TABLE users ADD COLUMN ${name} ${definition}`);
  }
}

db.exec(`
  CREATE UNIQUE INDEX IF NOT EXISTS users_unsubscribe_token_idx
    ON users(reminder_unsubscribe_token);
`);
const usersMissingUnsubscribeTokens = db
  .prepare('SELECT id FROM users WHERE reminder_unsubscribe_token IS NULL')
  .all();
const saveUnsubscribeToken = db.prepare(
  'UPDATE users SET reminder_unsubscribe_token = ? WHERE id = ?'
);
for (const user of usersMissingUnsubscribeTokens) {
  saveUnsubscribeToken.run(randomBytes(32).toString('base64url'), user.id);
}

export function getPublicUser(userId) {
  const user = db
    .prepare(
      `SELECT id, name, email, email_reminders_enabled, is_admin,
         email_verified_at, auth_provider, password_hash
       FROM users WHERE id = ?`
    )
    .get(userId);
  if (!user) return null;

  const subscription = db
    .prepare(
      `SELECT status, current_period_end
       FROM subscriptions
       WHERE user_id = ?
       ORDER BY updated_at DESC
       LIMIT 1`
    )
    .get(userId);
  const periodEnd = subscription && subscription.current_period_end
    ? Date.parse(subscription.current_period_end)
    : 0;
  const isPremium = Boolean(
    subscription &&
      ['active', 'non_renewing'].includes(subscription.status) &&
      periodEnd > Date.now()
  );

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isEmailVerified: Boolean(user.email_verified_at),
    canChangePassword: user.auth_provider === 'password' && Boolean(user.password_hash),
    emailRemindersEnabled: Boolean(user.email_reminders_enabled),
    isAdmin: Boolean(
      process.env.ADMIN_EMAIL &&
        user.is_admin &&
        user.email.toLowerCase() === process.env.ADMIN_EMAIL.trim().toLowerCase()
    ),
    isPremium,
    subscriptionStatus: subscription ? subscription.status : 'free',
    premiumUntil: subscription ? subscription.current_period_end : null,
  };
}
