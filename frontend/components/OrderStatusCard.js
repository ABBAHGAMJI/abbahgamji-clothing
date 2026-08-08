import { formatDate, formatNaira } from '../lib/format';

export default function OrderStatusCard({ order }) {
  const { id, total, status, stages, createdAt, estimatedDelivery } = order;
  const currentIndex = stages.indexOf(status);

  return (
    <div className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
      <div className="flex-between mb-16" style={{ flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div className="muted" style={{ fontSize: '.78rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>Order</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{id}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="muted" style={{ fontSize: '.78rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>Total</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{formatNaira(total)}</div>
        </div>
      </div>
      {createdAt && <p className="muted">Placed {formatDate(createdAt)}</p>}
      {estimatedDelivery?.label && <p className="muted">Estimated delivery: {estimatedDelivery.label}</p>}

      <div className="timeline">
        {stages.map((stage, i) => (
          <div key={stage} className={`timeline-step ${i < currentIndex ? 'done' : ''} ${i === currentIndex ? 'current' : ''}`}>
            <div className="timeline-dot">{i < currentIndex ? '✓' : ''}</div>
            <div className="timeline-label">{stage}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
