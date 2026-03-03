import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { getCountryName, getBrowserIcon, getDeviceIcon } from '@/lib/formatters';
import CountryFlag from './CountryFlag';
import VisitorAvatar from './VisitorAvatar';

export default function RealtimeUsers() {
  const [data, setData] = useState(null);
  const router = useRouter();
  const { siteId } = router.query;
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!siteId) return;

    const fetchRealtime = async () => {
      try {
        const res = await fetch(`/api/analytics/${siteId}/realtime`);
        if (res.ok) {
          setData(await res.json());
        }
      } catch {
        // silently fail on polling
      }
    };

    fetchRealtime();
    intervalRef.current = setInterval(fetchRealtime, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [siteId]);

  if (!data) return null;

  return (
    <div className="realtime-panel">
      <div className="realtime-header">
        <span className="realtime-dot" />
        <span className="realtime-count">{data.count}</span>
        <span className="realtime-label">
          {data.count === 1 ? 'visitor' : 'visitors'} online
        </span>
      </div>

      {data.users.length > 0 && (
        <table className="realtime-table">
          <thead>
            <tr>
              <th>Visitor</th>
              <th>Country</th>
              <th>Browser</th>
              <th>Device</th>
              <th>Page</th>
            </tr>
          </thead>
          <tbody>
            {data.users.slice(0, 20).map((user) => (
              <tr key={user.visitor_id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <VisitorAvatar visitorId={user.visitor_id} size={32} />
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {user.visitor_id.slice(0, 8)}...
                    </span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CountryFlag code={user.country} size="s" />
                    <span>{user.country ? getCountryName(user.country) : 'Unknown'}</span>
                  </div>
                </td>
                <td>{getBrowserIcon(user.browser)} {user.browser || 'Unknown'}</td>
                <td>{getDeviceIcon(user.device_type)} {user.device_type || 'Unknown'}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{user.current_page || '/'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {data.users.length > 20 && (
        <div style={{ padding: '10px 16px', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', borderTop: '1px solid var(--border-light)' }}>
          +{data.users.length - 20} more visitors
        </div>
      )}
    </div>
  );
}
