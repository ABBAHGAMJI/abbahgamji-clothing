// Simple file-based JSON database (lowdb). Good enough to launch with —
// swap this out for Postgres/MongoDB later without touching the routes much,
// since all the DB access is isolated to this one file.

const low = require('lowdb');
const FileSync = require('lowdb/FileSync');
const path = require('path');

const adapter = new FileSync(path.join(__dirname, 'db.json'));
const db = low(adapter);

// Every product now carries a stock count and a low-stock threshold so the
// admin dashboard can raise inventory alerts. Existing product objects don't
// need these — see the `withDefaults` pass right after this block.
db.defaults({
  products: [
    { id: 17, cat: "Caps", name: "Classic Embroidered Kufi Cap — Ivory", price: 8000, stock: 24, img: "https://images.unsplash.com/photo-1521369909029-2afed882baee?q=80&w=800&auto=format&fit=crop", desc: "Hand-embroidered kufi cap, the finishing touch on any kaftan or agbada." },
    { id: 18, cat: "Caps", name: "Classic Embroidered Kufi Cap — Charcoal", price: 8500, img: "https://images.unsplash.com/photo-1521369909029-2afed882baee?q=80&w=800&auto=format&fit=crop&sat=-30", desc: "Understated tone, same fine hand-stitched detailing." },
    { id: 1, cat: "Kaftan", name: "Premium Kaftan — Ivory Class", price: 45000, img: "https://images.unsplash.com/photo-1617196701537-7329482cc9fe?q=80&w=800&auto=format&fit=crop", desc: "Clean-lined and breathable, cut for everyday distinction." },
    { id: 2, cat: "Jallabiya", name: "Signature Jallabiya — Sandstone", price: 52000, img: "https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?q=80&w=800&auto=format&fit=crop", desc: "Relaxed, flowing, and finished by hand." },
    { id: 3, cat: "Senator Wear", name: "Senator Wear — Classic Two-Piece", price: 38000, img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop", desc: "Sharp, structured, built for the boardroom." },
    { id: 4, cat: "Agbada", name: "Ceremonial Agbada — Gold Embroidered", price: 95000, img: "https://images.unsplash.com/photo-1583334204245-3b0eff0e0664?q=80&w=800&auto=format&fit=crop", desc: "Grand, embroidered, cut for full presence." },
    { id: 9, cat: "Hijab", name: "Premium Hijab — Ivory Silk-Feel", price: 12000, img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop", desc: "Lightweight, opaque, drapes without slipping." },
    { id: 10, cat: "Hijab", name: "Premium Hijab — Sandstone Chiffon", price: 13500, img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop&sat=-20", desc: "Soft chiffon finish with a matte, breathable feel." },
    { id: 11, cat: "Long Gown", name: "Signature Long Gown — Emerald Abaya", price: 58000, img: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?q=80&w=800&auto=format&fit=crop", desc: "Flowing, floor-length, finished by hand with a clean silhouette." },
    { id: 12, cat: "Long Gown", name: "Ceremonial Long Gown — Gold-Trim Kaftan Dress", price: 72000, img: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?q=80&w=800&auto=format&fit=crop&sat=-20", desc: "Grand, embroidered hemline, cut for occasions that call for presence." },
    { id: 13, cat: "Shoes", name: "Classic Leather Slip-On", price: 32000, img: "https://images.unsplash.com/photo-1518049362265-d5b2a6467637?q=80&w=800&auto=format&fit=crop", desc: "Hand-finished leather, built to pair with kaftan or gown alike." },
    { id: 14, cat: "Shoes", name: "Embellished Occasion Heels", price: 41000, img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop", desc: "Subtle embellishment, comfortable heel, made for long occasions." },
    { id: 15, cat: "Handbags", name: "Structured Leather Handbag — Sandstone", price: 45000, img: "https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=800&auto=format&fit=crop", desc: "Clean-lined structure with a soft leather finish." },
    { id: 16, cat: "Handbags", name: "Embroidered Occasion Clutch — Gold", price: 36000, img: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=800&auto=format&fit=crop", desc: "Hand-embroidered detailing, sized for evenings out." },
    { id: 19, cat: "Perfume", name: "Oud Signature Perfume — 50ml", price: 35000, oldPrice: 40000, img: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800&auto=format&fit=crop", desc: "A deep, smoky oud with amber warmth — our signature house scent." },
    { id: 20, cat: "Perfume", name: "Amber Musk Eau De Parfum — 50ml", price: 27000, img: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?q=80&w=800&auto=format&fit=crop", desc: "Warm musk and soft amber, light enough for everyday wear." }
  ],
  orders: [],
  users: [],
  magicLinks: [], // one-time passwordless login tokens: { tokenHash, email, expiresAt, used }
  orderLinks: [],  // emailed order-verification/tracking tokens: { tokenHash, orderId, email, expiresAt, verifiedAt }
  reviews: [],     // { id, productId, name, rating, comment, createdAt, approved }
  coupons: [       // { code, type: 'percent'|'fixed', value, active, minSpend, expiresAt, usedCount }
    { code: "WELCOME10", type: "percent", value: 10, active: true, minSpend: 0, expiresAt: null, usedCount: 0 },
    { code: "FREESHIP", type: "fixed", value: 3000, active: true, minSpend: 30000, expiresAt: null, usedCount: 0 }
  ]
}).write();

// Backfill stock/threshold on any product that predates this field (keeps
// old db.json files working after an upgrade instead of showing "undefined").
db.get('products').forEach(p => {
  if (typeof p.stock !== 'number') p.stock = 20;
  if (typeof p.lowStockThreshold !== 'number') p.lowStockThreshold = 5;
}).write();

// Backfill loyalty points / wishlists on any user created before this field existed.
db.get('users').forEach(u => {
  if (typeof u.loyaltyPoints !== 'number') u.loyaltyPoints = 0;
}).write();

module.exports = db;
