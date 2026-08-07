require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// ---------- Startup env validation ----------
// Fail fast and loud rather than running with a blank JWT_SECRET/ADMIN_TOKEN,
// which would silently make auth trivially bypassable.
const REQUIRED_ENV = ['JWT_SECRET', 'ADMIN_TOKEN'];
const missing = REQUIRED_ENV.filter(key => !process.env[key] || !process.env[key].trim());
if (missing.length) {
  console.error(`Missing required environment variable(s): ${missing.join(', ')}`);
  console.error('Copy .env.example to .env and fill these in (see the README) before starting the server.');
  process.exit(1);
}
if (!process.env.FLW_SECRET_KEY) {
  console.warn('FLW_SECRET_KEY is not set — payment verification will fail until it is configured.');
}

const app = express();

// Render/Heroku/etc sit behind a reverse proxy — trust it for correct client
// IPs in rate limiting and secure-cookie detection.
app.set('trust proxy', 1);

// ---------- Security headers ----------
// Content-Security-Policy is deliberately permissive on a few directives
// (fonts/images/scripts from the CDNs the storefront already relies on —
// Google Fonts, Unsplash, Flutterwave's checkout widget). Tighten this list
// if you remove any of those integrations.
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://checkout.flutterwave.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://*.flutterwave.com"],
      connectSrc: ["'self'", "https://api.flutterwave.com"],
      frameSrc: ["https://checkout.flutterwave.com", "https://*.flutterwave.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false // would otherwise block the Flutterwave checkout iframe
}));

app.use(cors()); // harmless to keep — lets you also call the API from another origin later if needed

// A blanket ceiling on top of each route's own stricter limiter (login,
// magic-link, reviews, etc.) — stops any single IP from hammering the API.
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down and try again shortly.' }
}));

app.use(express.json({ limit: '200kb' })); // caps request body size — cheap defence against payload-flood abuse

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/coupons', require('./routes/coupons').router);
app.use('/api/analytics', require('./routes/analytics'));

// Serve the storefront and admin dashboard from the same server as the API.
// express.static automatically serves public/index.html at "/".
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',        // static assets (images, fonts) can be cached by the browser for a day
  setHeaders(res, filePath) {
    // HTML itself should always be revalidated so deploys show up immediately
    if (filePath.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
  }
}));

// ---------- 404 for unmatched API routes ----------
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));

// ---------- Centralized error handler ----------
// Catches anything thrown/rejected inside a route that wasn't already
// wrapped in its own try/catch, so a bug returns a clean 500 instead of
// crashing the process or leaking a stack trace to the client.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: 'Something went wrong on our end. Please try again.' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`ABBAHGAMJI running on port ${PORT} — storefront at /, admin at /admin.html`));
