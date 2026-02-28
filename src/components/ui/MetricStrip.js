export default function MetricStrip({ metrics }) {
  return (
    <div className="metrics-strip">
      {metrics.map((m, i) => {
        const formatted = formatValue(m.value, m.format);
        const changeVal = m.change;
        const isUp = changeVal > 0;
        const isDown = changeVal < 0;

        return (
          <div className="metric-item" key={i}>
            <div className="metric-item-label">{m.label}</div>
            <div className="metric-item-value">{formatted}</div>
            {changeVal !== undefined && changeVal !== null && (
              <div className={`metric-item-change ${isUp ? 'up' : isDown ? 'down' : ''}`}>
                {isDown ? '' : '+'}{changeVal}% {isUp ? '\u2191' : isDown ? '\u2193' : ''}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function formatValue(value, format) {
  if (value === undefined || value === null) return '-';
  if (format === 'currency') return '$' + (value / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  if (format === 'percent') return value + '%';
  if (format === 'duration') {
    if (!value) return '0s';
    const m = Math.floor(value / 60);
    const s = value % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  }
  if (typeof value === 'number') {
    if (value >= 1000) return (value / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return value.toLocaleString();
  }
  return value;
}
