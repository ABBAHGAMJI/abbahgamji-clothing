'use client';

import { MEASUREMENT_FIELDS } from '../lib/format';

export default function MeasurementsForm({ values, onChange }) {
  function set(key, val) {
    onChange({ ...values, [key]: val });
  }

  return (
    <div className="measure-grid">
      {MEASUREMENT_FIELDS.map((f) => (
        <div className="field" key={f.key} style={{ marginBottom: 0 }}>
          <label htmlFor={`m-${f.key}`}>{f.label}</label>
          <input
            id={`m-${f.key}`}
            type="number"
            min="0"
            step="0.1"
            value={values?.[f.key] ?? ''}
            onChange={(e) => set(f.key, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}
