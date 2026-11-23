const PROGRESS_KEY = 'ikwerre_path_v5';
const COURSE_KEY = 'ikw_course';

let hasAccountSession = false;
let progressSaveQueue = Promise.resolve();

function reportError(message) {
  window.dispatchEvent(
    new CustomEvent('app:service-error', { detail: { message } })
  );
}

async function request(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'same-origin',
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  if (response.status === 204) return null;
  const payload = await response.json();
  if (!response.ok) {
    const error = new Error(payload.error || `Request failed (${response.status}).`);
    error.code = payload.code;
    throw error;
  }
  return payload;
}

export function setAccountSession(active) {
  hasAccountSession = active;
}

export async function restoreSession() {
  try {
    const result = await request('/api/auth/me');
    hasAccountSession = true;
    return result.user;
  } catch (error) {
    if (error.message === 'Please sign in to continue.') {
      hasAccountSession = false;
      return null;
    }
    throw error;
  }
}

export async function signUpAccount({ name, email, password, emailRemindersEnabled }) {
  const result = await request('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, emailRemindersEnabled }),
  });
  return result;
}

export async function signInAccount({ email, password }) {
  const result = await request('/api/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  hasAccountSession = true;
  return result.user;
}

export async function verifyEmailAddress(token) {
  const result = await request('/api/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
  hasAccountSession = true;
  return result.user;
}

export async function resendVerificationEmail(email) {
  return request('/api/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function requestPasswordReset(email) {
  return request('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetAccountPassword({ token, password }) {
  return request('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
}

export async function changeAccountPassword({ currentPassword, newPassword }) {
  const result = await request('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  return result.user;
}

export async function signOutAccount() {
  await request('/api/auth/signout', { method: 'POST' });
  hasAccountSession = false;
}

export function loadProgress() {
  try {
    const stored = localStorage.getItem(PROGRESS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Could not read learning progress from browser storage.', error);
    return {};
  }
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Could not save learning progress to browser storage.', error);
    reportError('Learning progress could not be saved on this device.');
  }

  if (!hasAccountSession) return Promise.resolve();
  const snapshot = JSON.stringify(progress);
  progressSaveQueue = progressSaveQueue
    .catch(() => {})
    .then(() =>
      request('/api/progress', {
        method: 'PUT',
        body: JSON.stringify({ progress: JSON.parse(snapshot) }),
      })
    )
    .catch((error) => {
      console.error('Could not sync learning progress with the account.', error);
      reportError(error.message || 'Learning progress could not sync with your account.');
    });
  return progressSaveQueue;
}

export async function loadAccountProgress() {
  const result = await request('/api/progress');
  return result.progress;
}

export async function uploadAccountProgress(progress) {
  await request('/api/progress', {
    method: 'PUT',
    body: JSON.stringify({ progress }),
  });
}

export async function startPremiumCheckout() {
  const result = await request('/api/billing/checkout', { method: 'POST' });
  return result.authorizationUrl;
}

export async function verifyPremiumPayment(reference) {
  return request('/api/billing/verify', {
    method: 'POST',
    body: JSON.stringify({ reference }),
  });
}

export async function cancelPremiumSubscription() {
  return request('/api/billing/cancel', { method: 'POST' });
}

export async function updateEmailReminderPreference(enabled) {
  const result = await request('/api/reminders/preferences', {
    method: 'PUT',
    body: JSON.stringify({ enabled }),
  });
  return result.user;
}

export async function loadAdminSummary() {
  return request('/api/admin/summary');
}

export function loadCourse(fallback) {
  try {
    return localStorage.getItem(COURSE_KEY) || fallback;
  } catch (error) {
    console.error('Could not read course content from browser storage.', error);
    return fallback;
  }
}

export function saveCourse(course) {
  try {
    localStorage.setItem(COURSE_KEY, course);
  } catch (error) {
    console.error('Could not save course content to browser storage.', error);
    reportError('Course content could not be saved on this device.');
  }
}

export function resetCourse() {
  try {
    localStorage.removeItem(COURSE_KEY);
  } catch (error) {
    console.error('Could not reset course content in browser storage.', error);
    reportError('Course content could not be reset on this device.');
  }
}
