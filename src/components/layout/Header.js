import { useDateRange } from '@/contexts/DateRangeContext';

const periods = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '90d', label: '90d' },
  { value: '12m', label: '12m' },
];

export default function Header({ title }) {
  const { period, setPeriod, setCustomRange } = useDateRange();

  const handlePeriodChange = (value) => {
    setCustomRange(null);
    setPeriod(value);
  };

  return (
    <div className="header">
      <h1 className="header-title">{title || 'Analytics'}</h1>
      <div className="header-actions">
        <div className="date-picker">
          {periods.map((p) => (
            <button
              key={p.value}
              className={period === p.value ? 'active' : ''}
              onClick={() => handlePeriodChange(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
