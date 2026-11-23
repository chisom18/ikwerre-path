import { createHmac, timingSafeEqual } from 'node:crypto';

const PAYSTACK_API = 'https://api.paystack.co';

export class BillingUnavailableError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 503;
  }
}

function getConfig() {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  const planCode = process.env.PAYSTACK_PLAN_CODE;
  if (!secretKey || !planCode) {
    throw new BillingUnavailableError(
      'Premium checkout is not configured yet. Please try again later.'
    );
  }
  return { secretKey, planCode };
}

async function paystackRequest(path, body) {
  const { secretKey } = getConfig();
  const response = await fetch(`${PAYSTACK_API}${path}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error('Paystack returned an unreadable response.');
  }
  if (!response.ok || !result.status) {
    throw new Error('Paystack could not complete the request.');
  }
  return result.data;
}

export async function initializeCheckout(userId, email) {
  const { planCode } = getConfig();
  const plan = await paystackRequest(`/plan/${encodeURIComponent(planCode)}`);
  if (plan.amount !== 300_000 || plan.interval !== 'monthly' || plan.currency !== 'NGN') {
    throw new BillingUnavailableError(
      'The configured Paystack plan must be NGN 3,000 billed monthly.'
    );
  }

  const appOrigin = process.env.APP_ORIGIN || 'http://127.0.0.1:5173';
  return paystackRequest('/transaction/initialize', {
    email,
    plan: planCode,
    currency: 'NGN',
    callback_url: `${appOrigin.replace(/\/$/, '')}/?billing=return`,
    metadata: {
      user_id: userId,
      product: 'ikwerre-path-premium-monthly',
    },
  });
}

export async function verifyTransaction(reference) {
  return paystackRequest(`/transaction/verify/${encodeURIComponent(reference)}`);
}

export async function disableSubscription(subscriptionCode, emailToken) {
  return paystackRequest('/subscription/disable', {
    code: subscriptionCode,
    token: emailToken,
  });
}

export function validWebhookSignature(body, signature) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey || !signature) return false;
  const expected = createHmac('sha512', secretKey).update(body).digest();
  let actual;
  try {
    actual = Buffer.from(signature, 'hex');
  } catch {
    return false;
  }
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
