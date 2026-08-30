# BK Software Developers — Functional Enquiry Form

Complete website plus Node.js/Express enquiry API.

## Local setup
1. Install Node.js 20+.
2. `cd backend`
3. `npm install`
4. Copy `.env.example` to `.env` and fill in Resend credentials.
5. Run `npm start`.

The API runs on `http://localhost:3000`.

## Production
Deploy `backend` to Render. Set `RESEND_API_KEY`, `TO_EMAIL`, `FROM_EMAIL`, and `ALLOWED_ORIGINS` as Render environment variables. Set the frontend `window.BK_API_URL` to your Render URL plus `/api/enquiry`.

Never commit `.env` or expose the Resend API key in frontend code.

The API includes validation, rate limiting, a honeypot, CORS allow-listing, HTML escaping, and reply-to handling.
