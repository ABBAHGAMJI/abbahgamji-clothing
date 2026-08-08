export function formatNaira(amount) {
  const n = Number(amount) || 0;
  return `₦${n.toLocaleString('en-NG')}`;
}

export function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}

export const CATEGORIES = [
  'Kaftan', 'Jallabiya', 'Senator Wear', 'Agbada', 'Hijab', 'Long Gown',
  'Caps', 'Shoes', 'Handbags', 'Perfume'
];

// Categories the backend treats as made-to-measure for delivery-time purposes
// (routes/orders.js lengthens the delivery window whenever a cart item
// carries a `measurements` object) — these are the garment categories where
// offering the tailor's-inscription form on the product page makes sense.
export const MADE_TO_MEASURE_CATEGORIES = [
  'Kaftan', 'Jallabiya', 'Senator Wear', 'Agbada', 'Long Gown'
];

export const MEASUREMENT_FIELDS = [
  { key: 'chest', label: 'Chest (in)' },
  { key: 'waist', label: 'Waist (in)' },
  { key: 'hip', label: 'Hip (in)' },
  { key: 'shoulder', label: 'Shoulder (in)' },
  { key: 'sleeveLength', label: 'Sleeve Length (in)' },
  { key: 'height', label: 'Height (in)' },
  { key: 'neck', label: 'Neck (in)' }
];
