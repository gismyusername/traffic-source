export default function DataTable({ columns, data, maxBar }) {
  if (!data || data.length === 0) {
    return (
      <div className="empty-state">
        <p>No data for this period</p>
      </div>
    );
  }

  const maxValue = maxBar
    ? Math.max(...data.map((row) => row[maxBar] || 0))
    : 0;

  return (
    <table className="data-table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key} style={col.align === 'right' ? { textAlign: 'right' } : {}}>
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {columns.map((col) => {
              const value = row[col.key];
              const isBarCol = maxBar && col.key === columns[0].key;
              const barWidth = isBarCol && maxValue > 0
                ? `${((row[maxBar] || 0) / maxValue) * 100}%`
                : null;

              return (
                <td
                  key={col.key}
                  className={`${col.align === 'right' ? 'cell-right' : ''} ${isBarCol ? 'bar-cell' : ''}`}
                >
                  {isBarCol && <div className="bar-bg" style={{ width: barWidth }} />}
                  <span className={isBarCol ? 'bar-content' : ''}>
                    {col.render ? col.render(value, row) : value}
                  </span>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
