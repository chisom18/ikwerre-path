# Ikwerre Path

React/Vite frontend with an Express API and a local SQLite database. Requires
Node.js 22.13 or later (`node:sqlite` is built into Node).

## Run locally

```sh
npm install
npm run dev:all
```

The Vite app runs at `http://127.0.0.1:5173`; it proxies `/api` requests to the
Express API on port 3001. Signup, signin, http-only sessions, and account
progress syncing are provided by the API. Account creation requires a working
email provider so new users can verify their address. Guest preview is
available in development only; production builds require an account.

Run the API integration tests with `npm test`. Create a production frontend
build with `npm run build`; `npm start` serves that build and the API from the
same origin.

## Paystack Premium

Premium is NGN 3,000, recurring monthly. In the Paystack dashboard:

1. Create a monthly NGN 3,000 plan.
2. Set its plan code and the Paystack secret key in `.env`, using
   [`.env.example`](./.env.example) as a template. Never put the secret key in
   frontend code or commit `.env`.
3. Configure the Paystack webhook URL as
   `https://YOUR_DOMAIN/api/billing/webhook`.
4. Set `APP_ORIGIN` to the app's public origin.

Checkout stays disabled until the server can confirm that the configured plan
is exactly NGN 3,000 monthly. Premium is enabled by verified Paystack
subscription webhooks, not by the browser's return URL alone.

## Ads

The app is wired for Google AdSense ad units. Create an AdSense publisher
account, get the site approved, create an ad unit, then set the publisher ID
and slot ID in the Vite environment in `.env` and rebuild the frontend.
Until configured, the app shows an ad-space placeholder; Premium users do not
see ad slots.

AdSense serves advertiser campaigns and pays the publisher through its own
program. This does not provide direct company sponsorship sales or billing.

## Owner admin

Set `ADMIN_EMAIL` in `.env`, then run `npm run admin:setup` against the same
database used by the app. The command creates or promotes that account, resets
its password, and invalidates any existing sessions. The password is entered
without echoing in a terminal. Public signup alone can never grant admin access.

Restart the app, sign in with that account, open **Profile**, and select
**Open admin dashboard** to see account totals, recent sign-ins, Premium totals,
and reminder opt-ins.
The first version is owner-only and read-only; customer-service roles and
account actions are not enabled.

## Account email and password

The app uses Resend for verification, password reset, and opt-in reminder
emails. Verify a sender domain, then configure `RESEND_API_KEY`, `EMAIL_FROM`,
and `APP_ORIGIN` in `.env`. New password accounts must verify their email before
signing in. Verification links expire after 24 hours; password-reset links
expire after one hour and can only be used once. Users can request another
verification link or request a reset from the sign-in screen. Signed-in users
can change their password in **Profile → Change password**; changing or
resetting a password signs out other sessions.

Existing accounts are marked verified during the database migration so the
new requirement does not lock out current users. Google sign-in is not
implemented yet, so all accounts currently use a password; if a Google
provider is added later, its password will need to be managed through Google.

## Weekly email reminders

Users can opt in during signup or change the preference in Profile. The server
checks once a day and sends at most one reminder in seven days to opted-in,
verified accounts at least seven days old that have signed in fewer than three
times in the previous seven days. Every message has an unsubscribe link, and
users can also opt out in Profile. Email reminders and account emails require
the Resend settings above.

## Still needs provider setup

Payment processing and live ads require active Paystack and AdSense accounts
and their configuration. Use HTTPS in production so secure session cookies
work.
