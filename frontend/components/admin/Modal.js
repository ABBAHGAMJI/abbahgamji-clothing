'use client';

export default function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex-between mb-24">
          <h3>{title}</h3>
          <button className="icon-btn" style={{ color: 'var(--ink)' }} onClick={onClose} aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
