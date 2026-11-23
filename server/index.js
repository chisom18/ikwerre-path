import { randomBytes } from 'node:crypto';
import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import { db, getPublicUser } from './db.js';
import {
  createSession,
  destroySession,
  findSessionUser,
  passwordHash,
  passwordMatches,
  requireUser,
} from './auth.js';
import {
  createEmailToken,
  deleteEmailTokens,
  emailActionUrl,
  EmailDeliveryError,
  EmailDeliveryUnavailableError,
  findEmailToken,
  sendEmail,
} from './email.js';
import {
  BillingUnavailableError,
  disableSubscription,
  initializeCheckout,
  validWebhookSignature,
  verifyTransaction,
} from './paystack.js';

const app = express();
const PORT = Number(process.env.PORT || 3001);
const MAX_PROGRESS_BYTES = 400_000;
const frontendDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '../dist');
const REMINDER_INTERVAL_MS = 24 * 60 * 60 * 1000;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function unsubscribePage(message, token) {
  const form = token
    ? `<form method="post" action="/api/reminders/unsubscribe"><input type="hidden" name="token" value="${escapeHtml(token)}"><button type="submit">Unsubscribe</button></form>`
    : '';
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Email reminders</title><body style="font:16px system-ui;max-width:520px;margin:12vh auto;padding:24px;color:#332b21"><h1>Email reminders</h1><p>${escapeHtml(message)}</p>${form}</body></html>`;
}

app.disable('x-powered-by');
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

function sameOrigin(request, response, next) {
  if (
    request.method === 'POST' &&
    request.originalUrl.split('?')[0] === '/api/reminders/unsubscribe'
  ) {
    return next();
  }

  const origin = request.get('origin');
  if (!origin) return next();

  const allowedOrigins = new Set([
    process.env.APP_ORIGIN,
    `http://${request.get('host')}`,
    `https://${request.get('host')}`,
  ].filter(Boolean).map((value) => {
    try {
      return new URL(value).origin;
    } catch {
      return '';
    }
  }));

  if (!allowedOrigins.has(origin)) {
    response.status(403).json({ error: 'This request origin is not allowed.' });
    return;
  }
  next();
}

app.use('/api', sameOrigin);

app.post(
  '/api/billing/webhook',
  express.raw({ type: 'application/json', limit: '100kb' }),
  (request, response, next) => {
    const signature = request.get('x-paystack-signature');
    if (!Buffer.isBuffer(request.body) || !validWebhookSignature(request.body, signature)) {
      response.status(401).send('Invalid webhook signature.');
      return;
    }

    let event;
    try {
      event = JSON.parse(request.body.toString('utf8'));
    } catch (error) {
      next(error);
      return;
    }

    try {
      processPaystackEvent(event);
      response.sendStatus(200);
    } catch (error) {
      next(error);
    }
  }
);

app.use(express.json({ limit: '500kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many account attempts. Please wait and try again.' },
  skip: () => process.env.NODE_ENV === 'test',
});

function requireAdmin(request, response, next) {
  requireUser(request, response, () => {
    if (!request.user.isAdmin) {
      response.status(403).json({ error: 'Owner access is required.' });
      return;
    }
    next();
  });
}

function sendVerificationEmail(user) {
  const token = createEmailToken(user.id, 'verify_email');
  const url = emailActionUrl('/verify-email', token);
  return sendEmail({
    to: user.email,
    subject: 'Verify your Ikwerre Path email',
    html: `<p>Hi ${escapeHtml(user.name)},</p><p>Please verify your email address to finish creating your Ikwerre Path account.</p><p><a href="${escapeHtml(url)}">Verify my email</a></p><p>This link expires in 24 hours. If you did not create an account, you can ignore this message.</p>`,
  });
}

function sendPasswordResetEmail(user) {
  const token = createEmailToken(user.id, 'reset_password');
  const url = emailActionUrl('/reset-password', token);
  return sendEmail({
    to: user.email,
    subject: 'Reset your Ikwerre Path password',
    html: `<p>Hi ${escapeHtml(user.name)},</p><p>We received a request to reset the password for your Ikwerre Path account.</p><p><a href="${escapeHtml(url)}">Choose a new password</a></p><p>This link expires in one hour. If you did not request a reset, you can ignore this message.</p>`,
  });
}

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.post('/api/auth/signup', authRateLimit, async (request, response, next) => {
  const name = typeof request.body.name === 'string' ? request.body.name.trim() : '';
  const email = typeof request.body.email === 'string'
    ? request.body.email.trim().toLowerCase()
    : '';
  const password = typeof request.body.password === 'string' ? request.body.password : '';
  const emailRemindersEnabled = request.body.emailRemindersEnabled === true;

  if (name.length < 1 || name.length > 80) {
    response.status(400).json({ error: 'Enter a name between 1 and 80 characters.' });
    return;
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    response.status(400).json({ error: 'Enter a valid email address.' });
    return;
  }
  if (password.length < 8 || password.length > 128) {
    response.status(400).json({ error: 'Your password must be between 8 and 128 characters.' });
    return;
  }

  let userId;
  try {
    const result = db.prepare(
      `INSERT INTO users
         (name, email, password_hash, auth_provider, created_at,
          email_reminders_enabled, reminder_unsubscribe_token)
       VALUES (?, ?, ?, 'password', ?, ?, ?)`
    ).run(
      name,
      email,
      passwordHash(password),
      new Date().toISOString(),
      emailRemindersEnabled ? 1 : 0,
      randomBytes(32).toString('base64url')
    );
    userId = Number(result.lastInsertRowid);
  } catch (error) {
    if (error.errcode === 2067) {
      response.status(409).json({
        error: 'An account with this email already exists. Sign in or request another verification email.',
        code: 'ACCOUNT_EXISTS',
      });
      return;
    }
    next(error);
    return;
  }

  try {
    await sendVerificationEmail({ id: userId, name, email });
  } catch (error) {
    next(error);
    return;
  }

  response.status(201).json({
    verificationRequired: true,
    email,
    message: 'Check your email for a verification link to finish creating your account.',
  });
});

app.post('/api/auth/signin', authRateLimit, (request, response) => {
  const email = typeof request.body.email === 'string'
    ? request.body.email.trim().toLowerCase()
    : '';
  const password = typeof request.body.password === 'string' ? request.body.password : '';
  const user = db
    .prepare(
      `SELECT id, password_hash, auth_provider, email_verified_at
       FROM users WHERE email = ?`
    )
    .get(email);

  if (
    !user ||
    user.auth_provider !== 'password' ||
    !passwordMatches(password, user.password_hash)
  ) {
    response.status(401).json({ error: 'Email or password is incorrect.' });
    return;
  }

  if (!user.email_verified_at) {
    response.status(403).json({
      error: 'Verify your email address before signing in.',
      code: 'EMAIL_NOT_VERIFIED',
    });
    return;
  }

  createSession(response, user.id);
  response.json({ user: getPublicUser(user.id) });
});

app.post('/api/auth/resend-verification', authRateLimit, async (request, response, next) => {
  const email = typeof request.body.email === 'string'
    ? request.body.email.trim().toLowerCase()
    : '';
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    response.status(400).json({ error: 'Enter a valid email address.' });
    return;
  }

  const user = db
    .prepare(
      `SELECT id, name, email, email_verified_at
       FROM users WHERE email = ? AND auth_provider = 'password'`
    )
    .get(email);
  if (user && !user.email_verified_at) {
    try {
      await sendVerificationEmail(user);
    } catch (error) {
      next(error);
      return;
    }
  }
  response.status(202).json({
    message: 'If that address has an unverified account, a new verification link has been sent.',
  });
});

app.post('/api/auth/verify-email', authRateLimit, (request, response) => {
  const token = typeof request.body.token === 'string' ? request.body.token : '';
  const emailToken = findEmailToken(token, 'verify_email');
  if (!emailToken) {
    response.status(400).json({
      error: 'This verification link is invalid or expired. Request a new one and try again.',
    });
    return;
  }

  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(emailToken.user_id);
  if (!user) {
    response.status(400).json({ error: 'This account could not be found.' });
    return;
  }
  db.prepare(
    'UPDATE users SET email_verified_at = COALESCE(email_verified_at, ?) WHERE id = ?'
  ).run(new Date().toISOString(), user.id);
  deleteEmailTokens(user.id, 'verify_email');
  createSession(response, user.id);
  response.json({ user: getPublicUser(user.id) });
});

app.post('/api/auth/forgot-password', authRateLimit, async (request, response, next) => {
  const email = typeof request.body.email === 'string'
    ? request.body.email.trim().toLowerCase()
    : '';
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    response.status(400).json({ error: 'Enter a valid email address.' });
    return;
  }

  const user = db
    .prepare(
      `SELECT id, name, email
       FROM users
       WHERE email = ? AND auth_provider = 'password' AND email_verified_at IS NOT NULL`
    )
    .get(email);
  if (user) {
    try {
      await sendPasswordResetEmail(user);
    } catch (error) {
      next(error);
      return;
    }
  }
  response.status(202).json({
    message: 'If a password account exists for that address, a reset link has been sent.',
  });
});

app.post('/api/auth/reset-password', authRateLimit, (request, response) => {
  const token = typeof request.body.token === 'string' ? request.body.token : '';
  const password = typeof request.body.password === 'string' ? request.body.password : '';
  if (password.length < 8 || password.length > 128) {
    response.status(400).json({ error: 'Your password must be between 8 and 128 characters.' });
    return;
  }
  const emailToken = findEmailToken(token, 'reset_password');
  if (!emailToken) {
    response.status(400).json({
      error: 'This password reset link is invalid or expired. Request a new one and try again.',
    });
    return;
  }

  const result = db.prepare(
    `UPDATE users SET password_hash = ?
     WHERE id = ? AND auth_provider = 'password'`
  ).run(passwordHash(password), emailToken.user_id);
  if (!result.changes) {
    response.status(400).json({ error: 'This password reset link is invalid or expired.' });
    return;
  }
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(emailToken.user_id);
  deleteEmailTokens(emailToken.user_id, 'reset_password');
  response.json({ message: 'Your password has been reset. Sign in with your new password.' });
});

app.post('/api/auth/change-password', requireUser, (request, response) => {
  const currentPassword =
    typeof request.body.currentPassword === 'string' ? request.body.currentPassword : '';
  const newPassword =
    typeof request.body.newPassword === 'string' ? request.body.newPassword : '';
  if (newPassword.length < 8 || newPassword.length > 128) {
    response.status(400).json({ error: 'Your new password must be between 8 and 128 characters.' });
    return;
  }

  const user = db
    .prepare('SELECT password_hash, auth_provider FROM users WHERE id = ?')
    .get(request.user.id);
  if (!user || user.auth_provider !== 'password' || !user.password_hash) {
    response.status(403).json({ error: 'This account manages its password with its sign-in provider.' });
    return;
  }
  if (
    currentPassword.length > 128 ||
    !passwordMatches(currentPassword, user.password_hash)
  ) {
    response.status(401).json({ error: 'Your current password is incorrect.' });
    return;
  }

  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(
    passwordHash(newPassword),
    request.user.id
  );
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(request.user.id);
  deleteEmailTokens(request.user.id, 'reset_password');
  createSession(response, request.user.id);
  response.json({ user: getPublicUser(request.user.id) });
});

app.post('/api/auth/signout', requireUser, (request, response) => {
  destroySession(request, response);
  response.sendStatus(204);
});

app.get('/api/auth/me', (request, response) => {
  const user = findSessionUser(request);
  if (!user) {
    response.status(401).json({ error: 'Please sign in to continue.' });
    return;
  }
  response.json({ user });
});

app.get('/api/progress', requireUser, (request, response) => {
  const row = db
    .prepare('SELECT data FROM progress WHERE user_id = ?')
    .get(request.user.id);
  response.json({ progress: row ? JSON.parse(row.data) : null });
});

app.put('/api/progress', requireUser, (request, response) => {
  if (
    !request.body.progress ||
    typeof request.body.progress !== 'object' ||
    Array.isArray(request.body.progress)
  ) {
    response.status(400).json({ error: 'Progress must be a JSON object.' });
    return;
  }
  const data = JSON.stringify(request.body.progress);
  if (Buffer.byteLength(data, 'utf8') > MAX_PROGRESS_BYTES) {
    response.status(413).json({ error: 'Progress data is too large to save.' });
    return;
  }

  db.prepare(
    `INSERT INTO progress (user_id, data, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`
  ).run(request.user.id, data, new Date().toISOString());
  response.sendStatus(204);
});

app.put('/api/reminders/preferences', requireUser, (request, response) => {
  if (typeof request.body.enabled !== 'boolean') {
    response.status(400).json({ error: 'Reminder preference must be true or false.' });
    return;
  }

  db.prepare(
    'UPDATE users SET email_reminders_enabled = ? WHERE id = ?'
  ).run(request.body.enabled ? 1 : 0, request.user.id);
  response.json({ user: getPublicUser(request.user.id) });
});

app.get('/api/admin/summary', requireAdmin, (request, response) => {
  const now = new Date().toISOString();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const totalUsers = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
  const activeUsers = db
    .prepare(
      'SELECT COUNT(DISTINCT user_id) AS count FROM login_events WHERE created_at >= ?'
    )
    .get(weekAgo).count;
  const premiumUsers = db
    .prepare(
      `SELECT COUNT(DISTINCT user_id) AS count
       FROM subscriptions
       WHERE status IN ('active', 'non_renewing') AND current_period_end > ?`
    )
    .get(now).count;
  const reminderSubscribers = db
    .prepare(
      'SELECT COUNT(*) AS count FROM users WHERE email_reminders_enabled = 1'
    )
    .get().count;
  const recentUsers = db
    .prepare(
      `SELECT u.name, u.email, u.created_at,
         (SELECT MAX(l.created_at) FROM login_events l WHERE l.user_id = u.id) AS last_login_at
       FROM users u
       ORDER BY u.created_at DESC
       LIMIT 20`
    )
    .all();

  response.json({
    summary: {
      totalUsers,
      activeUsersLast7Days: activeUsers,
      premiumUsers,
      reminderSubscribers,
    },
    recentUsers,
  });
});

app.post('/api/billing/checkout', requireUser, async (request, response, next) => {
  try {
    const checkout = await initializeCheckout(request.user.id, request.user.email);
    if (!checkout.authorization_url || !checkout.reference) {
      response.status(502).json({ error: 'Paystack did not return a checkout link.' });
      return;
    }

    db.prepare(
      'INSERT INTO billing_attempts (reference, user_id, created_at) VALUES (?, ?, ?)'
    ).run(checkout.reference, request.user.id, new Date().toISOString());
    response.json({ authorizationUrl: checkout.authorization_url });
  } catch (error) {
    next(error);
  }
});

app.post('/api/billing/verify', requireUser, async (request, response, next) => {
  const reference = typeof request.body.reference === 'string'
    ? request.body.reference
    : '';
  if (!reference || reference.length > 100) {
    response.status(400).json({ error: 'A valid payment reference is required.' });
    return;
  }

  const attempt = db
    .prepare('SELECT user_id FROM billing_attempts WHERE reference = ?')
    .get(reference);
  if (!attempt || attempt.user_id !== request.user.id) {
    response.status(404).json({ error: 'This payment reference was not found.' });
    return;
  }

  try {
    const transaction = await verifyTransaction(reference);
    const paidForExpectedPlan =
      transaction.status === 'success' &&
      transaction.currency === 'NGN' &&
      transaction.amount === 300_000 &&
      transaction.customer?.email?.toLowerCase() === request.user.email;
    if (!paidForExpectedPlan) {
      response.status(409).json({ error: 'The payment is not confirmed yet.' });
      return;
    }

    db.prepare(
      `UPDATE billing_attempts SET status = 'verified' WHERE reference = ?`
    ).run(reference);
    response.json({
      confirmed: true,
      user: getPublicUser(request.user.id),
      message: 'Payment received. Premium will activate when Paystack confirms the subscription.',
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/billing/cancel', requireUser, async (request, response, next) => {
  const subscription = db
    .prepare(
      `SELECT subscription_code, email_token, current_period_end
       FROM subscriptions
       WHERE user_id = ? AND status = 'active'
       ORDER BY updated_at DESC
       LIMIT 1`
    )
    .get(request.user.id);
  if (!subscription || !subscription.email_token) {
    response.status(404).json({ error: 'No cancellable Premium subscription was found.' });
    return;
  }

  try {
    await disableSubscription(subscription.subscription_code, subscription.email_token);
    db.prepare(
      `UPDATE subscriptions
       SET status = 'non_renewing', updated_at = ?
       WHERE subscription_code = ?`
    ).run(new Date().toISOString(), subscription.subscription_code);
    response.json({
      user: getPublicUser(request.user.id),
      premiumUntil: subscription.current_period_end,
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/reminders/unsubscribe', (request, response) => {
  const token = typeof request.query.token === 'string' ? request.query.token : '';
  const user = token
    ? db
        .prepare(
          'SELECT email_reminders_enabled FROM users WHERE reminder_unsubscribe_token = ?'
        )
        .get(token)
    : null;
  if (!user) {
    response.status(404).type('html').send(
      unsubscribePage('This unsubscribe link is invalid or has expired.', '')
    );
    return;
  }

  const message = user.email_reminders_enabled
    ? 'Confirm that you want to stop weekly Ikwerre Path learning reminders.'
    : 'You are already unsubscribed from weekly learning reminders.';
  response.type('html').send(
    unsubscribePage(message, user.email_reminders_enabled ? token : '')
  );
});

app.post('/api/reminders/unsubscribe', (request, response) => {
  const token =
    typeof request.body.token === 'string'
      ? request.body.token
      : typeof request.query.token === 'string'
        ? request.query.token
        : '';
  if (!token || token.length > 100) {
    response.status(400).type('html').send(
      unsubscribePage('This unsubscribe link is invalid or has expired.', '')
    );
    return;
  }

  const result = db
    .prepare(
      `UPDATE users
       SET email_reminders_enabled = 0
       WHERE reminder_unsubscribe_token = ?`
    )
    .run(token);
  if (!result.changes) {
    response.status(404).type('html').send(
      unsubscribePage('This unsubscribe link is invalid or has expired.', '')
    );
    return;
  }
  response.type('html').send(
    unsubscribePage('You are unsubscribed from weekly learning reminders.', '')
  );
});

app.use('/api', (_request, response) => {
  response.status(404).json({ error: 'API endpoint not found.' });
});
if (existsSync(resolve(frontendDirectory, 'index.html'))) {
  app.use(express.static(frontendDirectory));
  app.use((request, response, next) => {
    if (
      request.method !== 'GET' ||
      request.path === '/api' ||
      request.path.startsWith('/api/')
    ) {
      next();
      return;
    }
    response.sendFile(resolve(frontendDirectory, 'index.html'), (error) => {
      if (error) next(error);
    });
  });
}

app.use((error, _request, response, _next) => {
  console.error('API request failed:', error);
  const status = error instanceof BillingUnavailableError
    ? error.statusCode
    : Number.isInteger(error.statusCode)
      ? error.statusCode
      : 500;
  response.status(status).json({
    error:
      error instanceof BillingUnavailableError ||
      error instanceof EmailDeliveryUnavailableError ||
      error instanceof EmailDeliveryError ||
      status < 500
        ? error.message
        : 'The server could not complete the request.',
  });
});

function processPaystackEvent(event) {
  const data = event && event.data;
  if (!data) return;

  if (event.event === 'subscription.create') {
    const email = data.customer?.email?.toLowerCase();
    const expectedPlan = process.env.PAYSTACK_PLAN_CODE;
    const actualPlan = data.plan?.plan_code || data.plan?.code;
    if (
      !email ||
      !expectedPlan ||
      actualPlan !== expectedPlan ||
      data.amount !== 300_000 ||
      (data.currency || data.plan?.currency) !== 'NGN' ||
      data.plan?.interval !== 'monthly'
    ) return;

    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (!user || !data.subscription_code) return;
    db.prepare(
      `INSERT INTO subscriptions
         (user_id, subscription_code, email_token, status, current_period_end, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(subscription_code) DO UPDATE SET
         email_token = excluded.email_token,
         status = excluded.status,
         current_period_end = excluded.current_period_end,
         updated_at = excluded.updated_at`
    ).run(
      user.id,
      data.subscription_code,
      data.email_token || null,
      data.status === 'active' ? 'active' : 'inactive',
      data.next_payment_date || null,
      new Date().toISOString()
    );
    return;
  }

  const subscriptionCode =
    data.subscription?.subscription_code || data.subscription_code;
  if (!subscriptionCode) return;

  const statusByEvent = {
    'invoice.payment_success': 'active',
    'invoice.payment_failed': 'past_due',
    'subscription.not_renew': 'non_renewing',
    'subscription.disable': 'disabled',
  };
  const status = statusByEvent[event.event];
  if (!status) return;

  db.prepare(
    `UPDATE subscriptions
     SET status = ?, current_period_end = COALESCE(?, current_period_end), updated_at = ?
     WHERE subscription_code = ?`
  ).run(
    status,
    data.next_payment_date || data.subscription?.next_payment_date || null,
    new Date().toISOString(),
    subscriptionCode
  );
}

async function sendWeeklyLearningReminders() {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM || !process.env.APP_ORIGIN) {
    return;
  }

  let appOrigin;
  try {
    appOrigin = new URL(process.env.APP_ORIGIN).origin;
  } catch {
    console.error('Weekly reminders are disabled because APP_ORIGIN is invalid.');
    return;
  }

  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const users = db
    .prepare(
      `SELECT u.id, u.name, u.email, u.reminder_unsubscribe_token
       FROM users u
       WHERE u.email_reminders_enabled = 1
         AND u.email_verified_at IS NOT NULL
         AND u.created_at <= ?
         AND (u.last_reminder_sent_at IS NULL OR u.last_reminder_sent_at <= ?)
         AND (
           SELECT COUNT(*) FROM login_events l
           WHERE l.user_id = u.id AND l.created_at >= ?
         ) < 3
       ORDER BY u.id
       LIMIT 100`
    )
    .all(cutoff, cutoff, cutoff);

  for (const user of users) {
    const unsubscribeUrl = new URL(
      `/api/reminders/unsubscribe?token=${encodeURIComponent(user.reminder_unsubscribe_token)}`,
      appOrigin
    ).toString();
    const name = escapeHtml(user.name);
    const html = `<p>Hi ${name},</p><p>You signed up for Ikwerre Path learning reminders. You have opened the app fewer than three times in the last seven days. A short practice session can help you keep your words fresh.</p><p><a href="${escapeHtml(appOrigin)}">Open Ikwerre Path</a></p><p><a href="${escapeHtml(unsubscribeUrl)}">Unsubscribe from weekly reminders</a></p>`;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Your Ikwerre Path weekly learning reminder',
        html,
        headers: {
          'List-Unsubscribe': `<${unsubscribeUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      });

      db.prepare(
        'UPDATE users SET last_reminder_sent_at = ? WHERE id = ? AND email_reminders_enabled = 1'
      ).run(new Date().toISOString(), user.id);
    } catch (error) {
      console.error(`Could not send a learning reminder to account ${user.id}.`, error);
    }
  }
}

const server = createServer(app);
server.listen(PORT, process.env.HOST || '0.0.0.0', () => {
  console.log(`Ikwerre Path API listening on port ${PORT}`);
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM || !process.env.APP_ORIGIN) {
    console.info(
      'Email verification, password recovery, and weekly reminders require Resend configuration.'
    );
  } else {
    sendWeeklyLearningReminders().catch((error) => {
      console.error('The weekly learning reminder check failed.', error);
    });
  }
});
const reminderInterval = setInterval(() => {
  sendWeeklyLearningReminders().catch((error) => {
    console.error('The weekly learning reminder check failed.', error);
  });
}, REMINDER_INTERVAL_MS);

function shutdown() {
  clearInterval(reminderInterval);
  server.close(() => {
    db.close();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
