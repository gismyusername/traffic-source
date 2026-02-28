import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function TimeSeriesChart({ data, dataKey = 'page_views', color = '#3b82f6' }) {
  if (!data || data.length === 0) {
    return (
      <div className="empty-state">
        <p>No data for this period</p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickFormatter={(val) => {
              if (val.includes(' ')) return val.split(' ')[1]; // hourly
              const d = new Date(val + 'T00:00:00');
              return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }}
          />
          <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} width={40} />
          <Tooltip
            contentStyle={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontSize: 13,
            }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            fill={color}
            fillOpacity={0.1}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
