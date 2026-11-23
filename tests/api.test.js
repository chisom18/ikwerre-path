import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { DatabaseSync } from 'node:sqlite';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createServer as createNetServer } from 'node:net';
import { createServer } from 'node:http';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
let serverProcess;
let dataDirectory;
let origin;
let serverOutput = '';
let mailServer;
let mailMessages = [];

async function unusedPort() {
  const server = createNetServer();
  await new Promise((resolveListen, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolveListen);
  });
  const { port } = server.address();
  await new Promise((resolveClose, reject) => {
    server.close((error) => error ? reject(error) : resolveClose());
  });
  return port;
}

async function waitForServer() {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    if (serverProcess.exitCode !== null) {
      throw new Error(`API server exited before becoming ready. ${serverOutput}`);
    }
    try {
      const response = await fetch(`${origin}/api/health`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 100));
  }
  throw new Error(`API server did not become ready in time. ${serverOutput}`);
}

before(async () => {
  dataDirectory = await mkdtemp(join(tmpdir(), 'ikwerre-path-api-'));
  const port = await unusedPort();
  const mailPort = await unusedPort();
  origin = `http://127.0.0.1:${port}`;
  const legacyDb = new DatabaseSync(join(dataDirectory, 'test.sqlite'));
  legacyDb.exec(
    `CREATE TABLE users (
       id INTEGER PRIMARY KEY,
       name TEXT NOT NULL,
       email TEXT NOT NULL UNIQUE,
       password_hash TEXT NOT NULL,
       created_at TEXT NOT NULL
     );
     INSERT INTO users (name, email, password_hash, created_at)
     VALUES ('Legacy User', 'legacy@example.com', 'legacy-password-hash', '2024-01-01T00:00:00.000Z');`
  );
  legacyDb.close();
  mailMessages = [];
  mailServer = createServer((request, response) => {
    let body = '';
    request.setEncoding('utf8');
    request.on('data', (chunk) => {
      body += chunk;
    });
    request.on('end', () => {
      mailMessages.push(JSON.parse(body));
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end('{"id":"test-email"}');
    });
  });
  await new Promise((resolveListen, reject) => {
    mailServer.once('error', reject);
    mailServer.listen(mailPort, '127.0.0.1', resolveListen);
  });
  serverProcess = spawn(process.execPath, ['server/index.js'], {
    cwd: projectRoot,
    env: {
      ...process.env,
      APP_ORIGIN: origin,
      DB_PATH: join(dataDirectory, 'test.sqlite'),
      ADMIN_EMAIL: 'owner@example.com',
      EMAIL_FROM: 'Ikwerre Path <test@example.com>',
      HOST: '127.0.0.1',
      NODE_ENV: 'test',
      PAYSTACK_PLAN_CODE: '',
      PAYSTACK_SECRET_KEY: '',
      PORT: String(port),
      RESEND_API_KEY: 'test-api-key',
      RESEND_API_URL: `http://127.0.0.1:${mailPort}/emails`,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  serverProcess.stdout.setEncoding('utf8').on('data', (chunk) => {
    serverOutput += chunk;
  });
  serverProcess.stderr.setEncoding('utf8').on('data', (chunk) => {
    serverOutput += chunk;
  });
  await waitForServer();
  const migratedDb = new DatabaseSync(join(dataDirectory, 'test.sqlite'));
  const migratedUser = migratedDb.prepare(
    'SELECT email_verified_at, created_at FROM users WHERE email = ?'
  ).get('legacy@example.com');
  assert.equal(migratedUser.email_verified_at, migratedUser.created_at);
  migratedDb.close();
});

after(async () => {
  if (serverProcess && serverProcess.exitCode === null) {
    const exited = new Promise((resolveExit) => serverProcess.once('exit', resolveExit));
    serverProcess.kill();
    await exited;
  }
  if (dataDirectory) {
    await rm(dataDirectory, { recursive: true, force: true });
  }
  if (mailServer) {
    await new Promise((resolveClose, reject) => {
      mailServer.close((error) => error ? reject(error) : resolveClose());
    });
  }
});

test('signup, session, and progress endpoints work', async () => {
  if (existsSync(join(projectRoot, 'dist', 'index.html'))) {
    const frontend = await fetch(origin);
    assert.equal(frontend.status, 200);
    assert.match(await frontend.text(), /Ikwerre Path/);
  }

  const commonHeaders = {
    Origin: origin,
    'Content-Type': 'application/json',
  };
  const signupResponse = await fetch(`${origin}/api/auth/signup`, {
    method: 'POST',
    headers: commonHeaders,
    body: JSON.stringify({
      name: 'Ada Ikwerre',
      email: 'ada@example.com',
      password: 'a-safe-test-password',
      emailRemindersEnabled: true,
    }),
  });
  assert.equal(signupResponse.status, 201);
  const signedUp = await signupResponse.json();
  assert.equal(signedUp.verificationRequired, true);
  assert.equal(signedUp.email, 'ada@example.com');
  assert.equal(signupResponse.headers.get('set-cookie'), null);
  assert.match(mailMessages.at(-1).subject, /verify/i);
  const verificationUrl = new URL(/href="([^"]+)"/.exec(mailMessages.at(-1).html)[1]);
  assert.equal(verificationUrl.origin, origin);
  assert.equal(verificationUrl.pathname, '/verify-email');
  const verificationToken = verificationUrl.searchParams.get('token');
  assert.ok(verificationToken);

  const unverifiedSignIn = await fetch(`${origin}/api/auth/signin`, {
    method: 'POST',
    headers: commonHeaders,
    body: JSON.stringify({
      email: 'ada@example.com',
      password: 'a-safe-test-password',
    }),
  });
  assert.equal(unverifiedSignIn.status, 403);
  assert.equal((await unverifiedSignIn.json()).code, 'EMAIL_NOT_VERIFIED');

  const testDb = new DatabaseSync(join(dataDirectory, 'test.sqlite'));
  const storedVerificationHash = testDb.prepare(
    `SELECT token_hash FROM email_tokens
     WHERE user_id = (SELECT id FROM users WHERE email = ?) AND purpose = 'verify_email'`
  ).get('ada@example.com').token_hash;
  assert.equal(
    storedVerificationHash,
    createHash('sha256').update(verificationToken).digest('hex')
  );
  testDb.close();

  const verificationResponse = await fetch(`${origin}/api/auth/verify-email`, {
    method: 'POST',
    headers: commonHeaders,
    body: JSON.stringify({ token: verificationToken }),
  });
  assert.equal(verificationResponse.status, 200);
  const verifiedUser = (await verificationResponse.json()).user;
  assert.equal(verifiedUser.name, 'Ada Ikwerre');
  assert.equal(verifiedUser.isPremium, false);
  assert.equal(verifiedUser.isAdmin, false);
  assert.equal(verifiedUser.emailRemindersEnabled, true);
  assert.equal(verifiedUser.isEmailVerified, true);
  assert.equal(verifiedUser.canChangePassword, true);
  let cookie = verificationResponse.headers.get('set-cookie')?.split(';')[0];
  assert.ok(cookie);

  const replayedVerification = await fetch(`${origin}/api/auth/verify-email`, {
    method: 'POST',
    headers: commonHeaders,
    body: JSON.stringify({ token: verificationToken }),
  });
  assert.equal(replayedVerification.status, 400);

  const sessionResponse = await fetch(`${origin}/api/auth/me`, {
    headers: { Cookie: cookie, Origin: origin },
  });
  assert.equal(sessionResponse.status, 200);
  assert.equal((await sessionResponse.json()).user.email, 'ada@example.com');

  const initialProgress = await fetch(`${origin}/api/progress`, {
    headers: { Cookie: cookie, Origin: origin },
  });
  assert.deepEqual(await initialProgress.json(), { progress: null });

  const progress = { xp: 25, done: { 'lesson-1': 1 } };
  const saveResponse = await fetch(`${origin}/api/progress`, {
    method: 'PUT',
    headers: { ...commonHeaders, Cookie: cookie },
    body: JSON.stringify({ progress }),
  });
  assert.equal(saveResponse.status, 204);
  const loadResponse = await fetch(`${origin}/api/progress`, {
    headers: { Cookie: cookie, Origin: origin },
  });
  assert.deepEqual((await loadResponse.json()).progress, progress);

  const nonAdminSummary = await fetch(`${origin}/api/admin/summary`, {
    headers: { Cookie: cookie, Origin: origin },
  });
  assert.equal(nonAdminSummary.status, 403);

  const reminderDb = new DatabaseSync(join(dataDirectory, 'test.sqlite'));
  const unsubscribeToken = reminderDb.prepare(
    'SELECT reminder_unsubscribe_token FROM users WHERE email = ?'
  ).get('ada@example.com').reminder_unsubscribe_token;
  reminderDb.close();
  const unsubscribePage = await fetch(
    `${origin}/api/reminders/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`
  );
  assert.equal(unsubscribePage.status, 200);
  assert.match(await unsubscribePage.text(), /Confirm that you want to stop/);
  const unsubscribeResponse = await fetch(`${origin}/api/reminders/unsubscribe`, {
    method: 'POST',
    headers: {
      ...commonHeaders,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ token: unsubscribeToken }),
  });
  assert.equal(unsubscribeResponse.status, 200);
  assert.match(await unsubscribeResponse.text(), /You are unsubscribed/);

  const reminderPreferenceResponse = await fetch(`${origin}/api/reminders/preferences`, {
    method: 'PUT',
    headers: { ...commonHeaders, Cookie: cookie },
    body: JSON.stringify({ enabled: true }),
  });
  assert.equal(reminderPreferenceResponse.status, 200);
  assert.equal((await reminderPreferenceResponse.json()).user.emailRemindersEnabled, true);
  const disableReminderResponse = await fetch(`${origin}/api/reminders/preferences`, {
    method: 'PUT',
    headers: { ...commonHeaders, Cookie: cookie },
    body: JSON.stringify({ enabled: false }),
  });
  assert.equal(disableReminderResponse.status, 200);
  assert.equal((await disableReminderResponse.json()).user.emailRemindersEnabled, false);

  const ownerSignupResponse = await fetch(`${origin}/api/auth/signup`, {
    method: 'POST',
    headers: commonHeaders,
    body: JSON.stringify({
      name: 'Owner',
      email: 'owner@example.com',
      password: 'a-safe-test-password',
    }),
  });
  assert.equal(ownerSignupResponse.status, 201);
  const ownerSignup = await ownerSignupResponse.json();
  assert.equal(ownerSignup.verificationRequired, true);
  assert.equal(ownerSignupResponse.headers.get('set-cookie'), null);
  const ownerVerificationUrl = new URL(
    /href="([^"]+)"/.exec(mailMessages.at(-1).html)[1]
  );
  const ownerVerificationResponse = await fetch(`${origin}/api/auth/verify-email`, {
    method: 'POST',
    headers: commonHeaders,
    body: JSON.stringify({ token: ownerVerificationUrl.searchParams.get('token') }),
  });
  assert.equal(ownerVerificationResponse.status, 200);
  const ownerCookie = ownerVerificationResponse.headers.get('set-cookie')?.split(';')[0];
  const ownerDb = new DatabaseSync(join(dataDirectory, 'test.sqlite'));
  ownerDb.prepare('UPDATE users SET is_admin = 1 WHERE email = ?').run('owner@example.com');
  ownerDb.close();

  const adminSummaryResponse = await fetch(`${origin}/api/admin/summary`, {
    headers: { Cookie: ownerCookie, Origin: origin },
  });
  assert.equal(adminSummaryResponse.status, 200);
  const adminSummary = await adminSummaryResponse.json();
  assert.equal(adminSummary.summary.totalUsers, 3);
  assert.equal(adminSummary.summary.activeUsersLast7Days, 2);
  assert.equal(adminSummary.summary.reminderSubscribers, 0);

  const pendingSignup = await fetch(`${origin}/api/auth/signup`, {
    method: 'POST',
    headers: commonHeaders,
    body: JSON.stringify({
      name: 'Pending User',
      email: 'pending@example.com',
      password: 'a-safe-test-password',
    }),
  });
  assert.equal(pendingSignup.status, 201);
  const originalVerificationUrl = new URL(
    /href="([^"]+)"/.exec(mailMessages.at(-1).html)[1]
  );
  const resendResponse = await fetch(`${origin}/api/auth/resend-verification`, {
    method: 'POST',
    headers: commonHeaders,
    body: JSON.stringify({ email: 'pending@example.com' }),
  });
  assert.equal(resendResponse.status, 202);
  const replacementVerificationUrl = new URL(
    /href="([^"]+)"/.exec(mailMessages.at(-1).html)[1]
  );
  assert.notEqual(
    replacementVerificationUrl.searchParams.get('token'),
    originalVerificationUrl.searchParams.get('token')
  );
  const invalidatedVerification = await fetch(`${origin}/api/auth/verify-email`, {
    method: 'POST',
    headers: commonHeaders,
    body: JSON.stringify({
      token: originalVerificationUrl.searchParams.get('token'),
    }),
  });
  assert.equal(invalidatedVerification.status, 400);
  const replacementVerification = await fetch(`${origin}/api/auth/verify-email`, {
    method: 'POST',
    headers: commonHeaders,
    body: JSON.stringify({
      token: replacementVerificationUrl.searchParams.get('token'),
    }),
  });
  assert.equal(replacementVerification.status, 200);

  const unavailableCheckout = await fetch(`${origin}/api/billing/checkout`, {
    method: 'POST',
    headers: { Cookie: cookie, Origin: origin },
  });
  assert.equal(unavailableCheckout.status, 503);
  assert.match((await unavailableCheckout.json()).error, /not configured/i);

  const duplicateSignup = await fetch(`${origin}/api/auth/signup`, {
    method: 'POST',
    headers: commonHeaders,
    body: JSON.stringify({
      name: 'Another Ada',
      email: 'ada@example.com',
      password: 'a-safe-test-password',
    }),
  });
  assert.equal(duplicateSignup.status, 409);

  const incorrectPasswordChange = await fetch(`${origin}/api/auth/change-password`, {
    method: 'POST',
    headers: { ...commonHeaders, Cookie: cookie },
    body: JSON.stringify({
      currentPassword: 'wrong-current-password',
      newPassword: 'a-new-safe-test-password',
    }),
  });
  assert.equal(incorrectPasswordChange.status, 401);

  const passwordChange = await fetch(`${origin}/api/auth/change-password`, {
    method: 'POST',
    headers: { ...commonHeaders, Cookie: cookie },
    body: JSON.stringify({
      currentPassword: 'a-safe-test-password',
      newPassword: 'a-new-safe-test-password',
    }),
  });
  assert.equal(passwordChange.status, 200);
  assert.equal((await passwordChange.json()).user.canChangePassword, true);
  const changedPasswordCookie = passwordChange.headers.get('set-cookie')?.split(';')[0];
  assert.ok(changedPasswordCookie);

  const oldPasswordSession = await fetch(`${origin}/api/auth/me`, {
    headers: { Cookie: cookie, Origin: origin },
  });
  assert.equal(oldPasswordSession.status, 401);
  cookie = changedPasswordCookie;
  const oldPasswordSignIn = await fetch(`${origin}/api/auth/signin`, {
    method: 'POST',
    headers: commonHeaders,
    body: JSON.stringify({
      email: 'ada@example.com',
      password: 'a-safe-test-password',
    }),
  });
  assert.equal(oldPasswordSignIn.status, 401);

  const forgotPassword = await fetch(`${origin}/api/auth/forgot-password`, {
    method: 'POST',
    headers: commonHeaders,
    body: JSON.stringify({ email: 'ada@example.com' }),
  });
  assert.equal(forgotPassword.status, 202);
  assert.match(mailMessages.at(-1).subject, /reset/i);
  const resetUrl = new URL(/href="([^"]+)"/.exec(mailMessages.at(-1).html)[1]);
  const firstResetToken = resetUrl.searchParams.get('token');
  assert.equal(resetUrl.pathname, '/reset-password');
  const resetTokenDb = new DatabaseSync(join(dataDirectory, 'test.sqlite'));
  resetTokenDb.prepare(
    `UPDATE email_tokens SET expires_at = 0
     WHERE token_hash = ? AND purpose = 'reset_password'`
  ).run(createHash('sha256').update(firstResetToken).digest('hex'));
  resetTokenDb.close();
  const expiredReset = await fetch(`${origin}/api/auth/reset-password`, {
    method: 'POST',
    headers: commonHeaders,
    body: JSON.stringify({ token: firstResetToken, password: 'a-reset-safe-password' }),
  });
  assert.equal(expiredReset.status, 400);

  const renewedForgotPassword = await fetch(`${origin}/api/auth/forgot-password`, {
    method: 'POST',
    headers: commonHeaders,
    body: JSON.stringify({ email: 'ada@example.com' }),
  });
  assert.equal(renewedForgotPassword.status, 202);
  const renewedResetUrl = new URL(
    /href="([^"]+)"/.exec(mailMessages.at(-1).html)[1]
  );
  const resetToken = renewedResetUrl.searchParams.get('token');
  const invalidReset = await fetch(`${origin}/api/auth/reset-password`, {
    method: 'POST',
    headers: commonHeaders,
    body: JSON.stringify({ token: 'invalid-token', password: 'a-reset-safe-password' }),
  });
  assert.equal(invalidReset.status, 400);

  const passwordReset = await fetch(`${origin}/api/auth/reset-password`, {
    method: 'POST',
    headers: commonHeaders,
    body: JSON.stringify({ token: resetToken, password: 'a-reset-safe-password' }),
  });
  assert.equal(passwordReset.status, 200);
  const replayedReset = await fetch(`${origin}/api/auth/reset-password`, {
    method: 'POST',
    headers: commonHeaders,
    body: JSON.stringify({ token: resetToken, password: 'another-reset-password' }),
  });
  assert.equal(replayedReset.status, 400);
  const resetRevokedSession = await fetch(`${origin}/api/auth/me`, {
    headers: { Cookie: cookie, Origin: origin },
  });
  assert.equal(resetRevokedSession.status, 401);

  const resetSignIn = await fetch(`${origin}/api/auth/signin`, {
    method: 'POST',
    headers: commonHeaders,
    body: JSON.stringify({
      email: 'ada@example.com',
      password: 'a-reset-safe-password',
    }),
  });
  assert.equal(resetSignIn.status, 200);
  cookie = resetSignIn.headers.get('set-cookie')?.split(';')[0];
  assert.ok(cookie);

  const signoutResponse = await fetch(`${origin}/api/auth/signout`, {
    method: 'POST',
    headers: { Cookie: cookie, Origin: origin },
  });
  assert.equal(signoutResponse.status, 204);
  const signedOutSession = await fetch(`${origin}/api/auth/me`, {
    headers: { Cookie: cookie, Origin: origin },
  });
  assert.equal(signedOutSession.status, 401);
});
