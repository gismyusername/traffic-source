export default function MetricCard({ label, value, change, format }) {
  const formattedValue = format === 'duration'
    ? formatDuration(value)
    : format === 'percent'
      ? `${value}%`
      : format === 'currency'
        ? `$${(value / 100).toFixed(2)}`
        : typeof value === 'number'
          ? value.toLocaleString()
          : value;

  return (
    <div className="metric-card">
      <div className="metric-card-label">{label}</div>
      <div className="metric-card-value">{formattedValue}</div>
      {change !== undefined && change !== null && (
        <span className={`metric-card-change ${change >= 0 ? 'positive' : 'negative'}`}>
          {change >= 0 ? '+' : ''}{change}%
        </span>
      )}
    </div>
  );
}

function formatDuration(seconds) {
  if (!seconds || seconds === 0) return '0s';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}
