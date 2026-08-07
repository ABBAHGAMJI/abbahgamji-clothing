# ABBAHGAMJI — Full Site (Frontend + Backend, One Project)

This is the whole ABBAHGAMJI site: the storefront, the admin dashboard, and
the API that powers both, running as a single Node/Express app. Storefront
and API share one origin, so there's no separate URL to configure and no
CORS to think about.

```
backend/
  public/
    index.html     ← storefront (served at  /)
    admin.html     ← admin dashboard (served at  /admin.html)
    robots.txt
    sitemap.xml
  routes/           ← API route handlers
  server.js         ← serves public/ AND the /api/* routes
  db.js             ← file-based database (lowdb)
  .env.example
```

## What this replaces

Originally the site was static HTML that kept products, orders, and accounts
in browser memory — they vanished on refresh. This project stores them in a
file (`db.json`, via lowdb) so they persist between visits, and moves the two
things that must never live in a browser — password checking and payment
verification — onto the server.

## 1. Install

```bash
cd backend
npm install
```

## 2. Configure

```bash
cp .env.example .env
```

Then open `.env` and fill in:
- `JWT_SECRET` and `ADMIN_TOKEN` — any long random string (the file tells you how to generate one)
- `FLW_SECRET_KEY` — from your Flutterwave dashboard, under Settings → API Keys. Start with the **test** secret key while you're building.

## 3. Run locally

```bash
npm start
```

Then open:
- `http://localhost:4000/` — the storefront
- `http://localhost:4000/admin.html` — the admin dashboard (log in with your `ADMIN_TOKEN` from `.env` as the password)

Both pages already call the API on the same origin — nothing else to wire up.

## 4. API endpoints

| Method | Path                          | Auth   | Purpose |
|--------|-------------------------------|--------|---------|
| POST   | /api/auth/register            | —      | Create a customer account |
| POST   | /api/auth/login               | —      | Log in, get a token |
| POST   | /api/auth/magic-link          | —      | Request a passwordless login link, emailed (or logged) to the given address |
| POST   | /api/auth/magic-login         | —      | Redeem a magic-link token from the URL, get a token |
| GET    | /api/auth/me                  | token  | Get the logged-in customer's profile |
| PUT    | /api/auth/measurements        | token  | Save a customer's tailor's inscription |
| GET    | /api/products                 | —      | List products (optional `?category=Kaftan`) |
| POST   | /api/products                 | admin  | Add a product |
| PUT    | /api/products/:id              | admin  | Edit a product |
| DELETE | /api/products/:id              | admin  | Remove a product |
| POST   | /api/orders                   | —      | Place an order |
| GET    | /api/orders/track?query=...   | —      | Look up an order by ID or phone |
| GET    | /api/orders                   | admin  | List every order |
| PATCH  | /api/orders/:id/status         | admin  | Update an order's delivery stage |
| POST   | /api/payments/verify           | —      | Verify a Flutterwave transaction server-side |
| GET    | /api/customers                 | admin  | List customer accounts |

"admin" routes expect `Authorization: Bearer <ADMIN_TOKEN>` matching the value in `.env`.
"token" routes expect `Authorization: Bearer <token>` from `/api/auth/login`.

## 5. Deploying

Any Node host works. Render's free tier is a common starting point:

1. Push this whole `backend/` folder (including `public/`) to a GitHub repo.
2. On Render: New → Web Service → connect the repo.
3. Build command: `npm install`. Start command: `npm start`.
4. Add the environment variables from `.env` in Render's dashboard (never commit your real `.env` file).
5. Once deployed, Render gives you one URL — that URL *is* your live store. `https://your-app.onrender.com/` is the storefront, `https://your-app.onrender.com/admin.html` is the dashboard.

## 6. Magic link (passwordless) login

Customers can log in with just their email — no password required:

1. On the storefront's login tab, they enter their email under "Email Me A Magic Link."
2. The server creates a one-time token (valid 15 minutes, single use) and either emails it or, **if no SMTP is configured**, logs the link to the server console and also returns it in the API response as `devMagicUrl` — so you can test the whole flow locally before setting up real email.
3. Clicking the link opens the storefront at `/?magicToken=...`; the page automatically redeems it, logs the customer in, and strips the token from the address bar.
4. If it's the customer's first time logging in this way, an account is created automatically from their email — no separate registration step needed.

To send real emails instead of logging the link, fill in `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` (and optionally `SMTP_PORT`, `SMTP_FROM`) in `.env` — any standard SMTP provider works (e.g. Gmail app password, SendGrid, Mailgun, Resend's SMTP relay). Also set `FRONTEND_URL` to your real deployed URL once you have one, so the links point to the right place.

## 7. New product categories: Hijab, Long Gown, Shoes, Handbags

The catalog now includes five additional categories alongside the original menswear line (Kaftan, Jallabiya, Senator Wear, Agbada):

- **Caps** (men's — shown first in the shop filter row)
- **Hijab**
- **Long Gown** (abayas / occasion gowns)
- **Shoes**
- **Handbags**

Sample products for each were added to `db.js`'s defaults and to the storefront's fallback `PRODUCTS` list in `index.html` (used only if the API can't be reached). Manage the real catalog the same way as before — through `/admin.html` or the `/api/products` endpoints — the new categories work like any other; there's nothing category-specific in the backend logic.

## 8. Growing past this MVP

`db.json` (via lowdb) is a real file on disk — fine for getting started, but:
- On most hosting platforms, disk storage isn't guaranteed to persist across
  deploys/restarts. For a production store, move to a real database
  (Postgres via Supabase/Neon, or MongoDB Atlas both have generous free tiers).
- Add rate limiting on `/api/auth/login` to slow down password-guessing attempts.
- Add HTTPS (most hosts provide this automatically) — never send passwords or
  payment data over plain HTTP.
- Customer login sessions (the JWT) are currently held only in a JavaScript
  variable in the browser, so a page refresh logs the customer out. Fine for
  testing; for a smoother experience later, consider persisting it in an
  httpOnly cookie set by the server, which is more secure than browser
  storage.
