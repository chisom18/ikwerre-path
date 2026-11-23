import { randomBytes } from 'node:crypto';
import { createInterface } from 'node:readline';
import { stdin, stdout } from 'node:process';
import { db } from './db.js';
import { passwordHash } from './auth.js';

async function ask(question) {
  const prompt = createInterface({ input: stdin, output: stdout });
  try {
    return await prompt.question(question);
  } finally {
    prompt.close();
  }
}

async function askPassword() {
  if (!stdin.isTTY || typeof stdin.setRawMode !== 'function') {
    return ask('Owner password (minimum 8 characters): ');
  }

  stdout.write('Owner password (minimum 8 characters): ');
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding('utf8');

  return new Promise((resolve, reject) => {
    let password = '';
    const finish = (error) => {
      stdin.removeListener('data', onData);
      stdin.setRawMode(false);
      stdin.pause();
      stdout.write('\n');
      if (error) reject(error);
      else resolve(password);
    };
    const onData = (chunk) => {
      for (const character of chunk) {
        if (character === '\u0003') {
          finish(new Error('Admin setup cancelled.'));
          return;
        }
        if (character === '\r' || character === '\n') {
          finish();
          return;
        }
        if (character === '\u0008' || character === '\u007f') {
          password = password.slice(0, -1);
        } else if (character >= ' ') {
          password += character;
        }
      }
    };
    stdin.on('data', onData);
  });
}

async function main() {
  const configuredEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  if (!configuredEmail) {
    throw new Error('Set ADMIN_EMAIL in .env before creating the owner account.');
  }

  const name = (await ask('Owner name: ')).trim();
  const email = (await ask(`Owner email [${configuredEmail}]: `))
    .trim()
    .toLowerCase() || configuredEmail;
  const password = await askPassword();

  if (email !== configuredEmail) {
    throw new Error('The owner email must match ADMIN_EMAIL.');
  }
  if (!name || name.length > 80) {
    throw new Error('Enter a name between 1 and 80 characters.');
  }
  if (password.length < 8 || password.length > 128) {
    throw new Error('The password must be between 8 and 128 characters.');
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  db.exec('BEGIN IMMEDIATE');
  try {
    if (existing) {
      db.prepare(
        `UPDATE users
         SET name = ?, password_hash = ?, auth_provider = 'password',
             email_verified_at = COALESCE(email_verified_at, ?), is_admin = 1
         WHERE id = ?`
      ).run(name, passwordHash(password), new Date().toISOString(), existing.id);
      db.prepare('DELETE FROM sessions WHERE user_id = ?').run(existing.id);
    } else {
      db.prepare(
        `INSERT INTO users
           (name, email, password_hash, auth_provider, email_verified_at,
            created_at, is_admin, reminder_unsubscribe_token)
         VALUES (?, ?, ?, 'password', ?, ?, 1, ?)`
      ).run(
        name,
        email,
        passwordHash(password),
        new Date().toISOString(),
        new Date().toISOString(),
        randomBytes(32).toString('base64url')
      );
    }
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }

  console.log(`Owner admin account ready for ${email}. Sign in to open the dashboard.`);
}

main()
  .catch((error) => {
    console.error('Could not create the owner admin account:', error.message);
    process.exitCode = 1;
  })
  .finally(() => db.close());
