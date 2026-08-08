# ABBAHGAMJI — Frontend

Next.js 14 (App Router) storefront + admin dashboard for ABBAHGAMJI. This is a
**separate project** from the `abbahgamji-backend` Express API — it talks to
that backend over HTTP and holds no database of its own.

> **Note on Supabase:** the backend in this project's companion zip does not
> use Supabase — it's a plain Express API with JWT auth, a local JSON-file
> database, and Flutterwave for payments. This frontend is built to match
> that, not Supabase. If you want Supabase later, that's a backend change,
> not a frontend one.

## What's included

- Storefront: home, shop with category filters, product detail with
  made-to-measure "tailor's inscription" measurements, cart, checkout
  (Flutterwave inline payment), order confirmation, order tracking by ID or
  phone, customer login (password or magic link), registration, and an
  account page for saved measurements and loyalty points.
- Admin dashboard at `/admin`: analytics overview, products CRUD, orders with
  status updates and CSV export, coupons, review moderation, and a customer
  list. Access is gated by the same `ADMIN_TOKEN` value the backend's
  `requireAdmin` middleware checks — there's no separate admin login system
  on the backend, so the dashboard just asks for that token once and stores
  it locally.
- Plain CSS (no Tailwind/UI framework) styled to match the existing brand:
  Oxford Blue, gold, ivory, Playfair Display + Inter.

## Setup

```bash
npm install
cp .env.example .env.local
# edit .env.local — see below
npm run dev
```

Open http://localhost:3000. Make sure the backend is running (see its own
README) at the URL you set in `NEXT_PUBLIC_API_URL`.

## Environment variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API, no trailing slash. |
| `NEXT_PUBLIC_FLW_PUBLIC_KEY` | Flutterwave **public** key. The secret key stays in the backend's `.env` only. |

Both are `NEXT_PUBLIC_*` because they're needed in the browser — neither is a
secret that grants write access.

## How admin access works

The backend has no per-admin accounts — every `requireAdmin` route just
checks a bearer token against a single `ADMIN_TOKEN` value in the backend's
`.env`. Visiting `/admin` on this frontend asks for that same token once,
verifies it against a real admin endpoint, and stores it in
`localStorage` for next time. Anyone with that token has full admin access,
so treat it like a password and don't commit it.

## Deploying to Vercel

1. Push this project to its own Git repo (keep it separate from the
   backend repo, or put it in a subdirectory and set that as the Vercel
   project's root).
2. Import the repo in Vercel, framework preset **Next.js**.
3. Add the two environment variables above in Vercel's Project Settings →
   Environment Variables, pointing `NEXT_PUBLIC_API_URL` at wherever the
   backend is deployed (e.g. Render, Railway, Fly.io — this repo doesn't
   include hosting for the backend).
4. Deploy. Every API call happens client-side, so no server-side secrets are
   needed on Vercel beyond the two `NEXT_PUBLIC_*` values above.
5. On the backend, make sure `FRONTEND_URL` (used to build magic-login and
   order-tracking email links) points at this frontend's deployed URL, and
   that CORS on the backend allows it.

## Project structure

```
app/
  layout.js            root shell (html/body/providers)
  providers.js          Cart + Auth + AdminAuth context providers
  globals.css           brand tokens & all styling
  (site)/               storefront route group — has Header/Footer/CartDrawer
    page.js              home
    shop/                category browsing
    product/[id]/        product detail
    cart/, checkout/      cart & checkout
    order-confirmation/[id]/
    track/                order tracking
    login/, register/, account/
  admin/                 admin dashboard — its own shell, gated by ADMIN_TOKEN
    page.js               analytics
    products/, orders/, coupons/, reviews/, customers/
components/             shared UI + components/admin/
context/                CartContext, AuthContext, AdminAuthContext
lib/                    api.js (backend client), format.js (currency/date/categories)
```

## Known limitations / next steps

- Product images are plain URLs (entered by the admin) — there's no image
  upload; the backend doesn't expose one either.
- The Flutterwave widget loads via `<script>` tag (their v3 inline checkout);
  swap for `flutterwave-react-v3` if you'd rather have a typed React wrapper.
- No SSR/ISR — every page fetches client-side from the Express API, which
  keeps the two projects fully decoupled but means no SEO-time product data.
  If that matters later, product pages are the ones worth converting to
  server components with `fetch(..., { next: { revalidate: ... } })`.
