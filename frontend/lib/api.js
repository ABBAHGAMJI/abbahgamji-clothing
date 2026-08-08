// Thin wrapper around the ABBAHGAMJI backend REST API.
// Every function here maps 1:1 to a route in the Express backend — see
// that project's routes/ folder if you need to double check a shape.

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status, detail) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

async function request(path, { method = 'GET', body, token, isForm = false } = {}) {
  const headers = {};
  if (!isForm) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
  } catch (err) {
    throw new ApiError('Could not reach the server. Check your connection and try again.', 0);
  }

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json().catch(() => ({})) : await res.text();

  if (!res.ok) {
    const message = (isJson && data && data.error) || 'Something went wrong. Please try again.';
    throw new ApiError(message, res.status, isJson ? data : undefined);
  }
  return data;
}

// ---------- Auth ----------
export const authApi = {
  register: (name, email, password) => request('/api/auth/register', { method: 'POST', body: { name, email, password } }),
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: { email, password } }),
  requestMagicLink: (email) => request('/api/auth/magic-link', { method: 'POST', body: { email } }),
  magicLogin: (token) => request('/api/auth/magic-login', { method: 'POST', body: { token } }),
  me: (token) => request('/api/auth/me', { token }),
  updateMeasurements: (token, measurements) => request('/api/auth/measurements', { method: 'PUT', body: measurements, token })
};

// ---------- Products ----------
export const productsApi = {
  list: (category) => request(`/api/products${category && category !== 'all' ? `?category=${encodeURIComponent(category)}` : ''}`),
  create: (adminToken, product) => request('/api/products', { method: 'POST', body: product, token: adminToken }),
  update: (adminToken, id, updates) => request(`/api/products/${id}`, { method: 'PUT', body: updates, token: adminToken }),
  remove: (adminToken, id) => request(`/api/products/${id}`, { method: 'DELETE', token: adminToken })
};

// ---------- Orders ----------
export const ordersApi = {
  create: (payload, token) => request('/api/orders', { method: 'POST', body: payload, token }),
  verifyLink: (linkToken) => request(`/api/orders/verify?token=${encodeURIComponent(linkToken)}`),
  track: (query) => request(`/api/orders/track?query=${encodeURIComponent(query)}`),
  listAdmin: (adminToken) => request('/api/orders', { token: adminToken }),
  updateStatus: (adminToken, id, status) => request(`/api/orders/${id}/status`, { method: 'PATCH', body: { status }, token: adminToken }),
  exportCsvUrl: () => `${API_URL}/api/orders/export`
};

// ---------- Payments ----------
export const paymentsApi = {
  verify: (transaction_id, order_id) => request('/api/payments/verify', { method: 'POST', body: { transaction_id, order_id } })
};

// ---------- Customers (admin) ----------
export const customersApi = {
  list: (adminToken) => request('/api/customers', { token: adminToken })
};

// ---------- Reviews ----------
export const reviewsApi = {
  list: (productId) => request(`/api/reviews?productId=${encodeURIComponent(productId)}`),
  summary: () => request('/api/reviews/summary'),
  create: (review) => request('/api/reviews', { method: 'POST', body: review }),
  remove: (adminToken, id) => request(`/api/reviews/${id}`, { method: 'DELETE', token: adminToken })
};

// ---------- Coupons ----------
export const couponsApi = {
  validate: (code, subtotal) => request(`/api/coupons/validate?code=${encodeURIComponent(code)}&subtotal=${subtotal}`),
  listAdmin: (adminToken) => request('/api/coupons', { token: adminToken }),
  create: (adminToken, coupon) => request('/api/coupons', { method: 'POST', body: coupon, token: adminToken }),
  patch: (adminToken, code, updates) => request(`/api/coupons/${code}`, { method: 'PATCH', body: updates, token: adminToken }),
  remove: (adminToken, code) => request(`/api/coupons/${code}`, { method: 'DELETE', token: adminToken })
};

// ---------- Analytics (admin) ----------
export const analyticsApi = {
  summary: (adminToken) => request('/api/analytics/summary', { token: adminToken })
};

export { API_URL };
