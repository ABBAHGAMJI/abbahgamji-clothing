export default function StarRating({ value = 0, count, size = 14 }) {
  const rounded = Math.round(value);
  return (
    <div className="stars">
      <span aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} style={{ fontSize: size }}>{n <= rounded ? '★' : '☆'}</span>
        ))}
      </span>
      {typeof count === 'number' && <span className="count">({count})</span>}
    </div>
  );
}
