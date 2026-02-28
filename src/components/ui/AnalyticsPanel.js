import { useState } from 'react';

export default function AnalyticsPanel({ tabs, data, valueKey = 'count', labelKey = 'name', defaultTab, renderValue }) {
  const [activeTab, setActiveTab] = useState(defaultTab || (tabs && tabs[0]?.key));

  const activeData = tabs ? data?.[activeTab] || [] : data || [];
  const maxValue = Math.max(...activeData.map((r) => r[valueKey] || 0), 1);

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-tabs">
          {tabs?.map((tab) => (
            <button
              key={tab.key}
              className={`panel-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="panel-sort">Visitors &#x2195;</div>
      </div>
      <div className="panel-body">
        {activeData.length === 0 ? (
          <div className="empty-state"><p>No data yet</p></div>
        ) : (
          activeData.map((row, i) => {
            const pct = ((row[valueKey] || 0) / maxValue) * 100;
            const displayValue = renderValue
              ? renderValue(row[valueKey], row)
              : formatNumber(row[valueKey]);

            return (
              <div className="analytics-row" key={i}>
                <div
                  className="analytics-row-bar"
                  style={{ width: `${pct}%` }}
                />
                <div className="analytics-row-name">{row[labelKey]}</div>
                <div className="analytics-row-value">{displayValue}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function formatNumber(n) {
  if (n === undefined || n === null) return '-';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return n.toLocaleString();
}
