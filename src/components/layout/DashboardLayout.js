import Link from 'next/link';
import { useRouter } from 'next/router';
import ProtectedRoute from '../ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useDateRange } from '@/contexts/DateRangeContext';

const periods = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: '12m', label: '12 months' },
];

export default function DashboardLayout({ children, siteId, siteName }) {
  const router = useRouter();
  const { logout } = useAuth();
  const { period, setPeriod, setCustomRange } = useDateRange();
  const path = router.asPath;

  return (
    <ProtectedRoute>
      <div className="app-topbar">
        <div className="app-topbar-left">
          <Link href="/sites" className="app-topbar-logo">
            TS
          </Link>

          {siteName && (
            <button
              className="app-topbar-site"
              onClick={() => router.push('/sites')}
            >
              {siteName}
            </button>
          )}

          <div className="date-picker">
            {periods.map((p) => (
              <button
                key={p.value}
                className={period === p.value ? 'active' : ''}
                onClick={() => { setCustomRange(null); setPeriod(p.value); }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="app-topbar-right">
          <div className="app-topbar-nav">
            <Link href="/sites" className={path === '/sites' ? 'active' : ''}>Sites</Link>
            <Link href="/settings" className={path === '/settings' ? 'active' : ''}>Settings</Link>
            <button onClick={logout}>Sign out</button>
          </div>
        </div>
      </div>

      <main className="app-content">
        {children}
      </main>
    </ProtectedRoute>
  );
}
