import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function BarBreakdownChart({ data, dataKey = 'count', color = '#3b82f6' }) {
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
        <BarChart
          data={data.slice(0, 10)}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            width={70}
          />
          <Tooltip
            contentStyle={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontSize: 13,
            }}
          />
          <Bar dataKey={dataKey} fill={color} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
