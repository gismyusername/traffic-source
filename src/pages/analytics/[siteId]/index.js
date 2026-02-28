import { useRouter } from 'next/router';
import Head from 'next/head';
import DashboardLayout from '@/components/layout/DashboardLayout';
import MetricStrip from '@/components/ui/MetricStrip';
import AnalyticsPanel from '@/components/ui/AnalyticsPanel';
import CombinedChart from '@/components/charts/CombinedChart';
import { useAnalytics } from '@/hooks/useAnalytics';

export default function Analytics() {
  const router = useRouter();
  const { siteId } = router.query;
  const { data, loading } = useAnalytics('overview');

  if (loading || !data) {
    return (
      <>
        <Head><title>Analytics - Traffic Source</title></Head>
        <DashboardLayout siteId={siteId}>
          <div className="loading-inline"><div className="loading-spinner" /></div>
        </DashboardLayout>
      </>
    );
  }

  const conv = data.conversions?.totals || {};
  const revenuePerVisitor = data.current.visitors > 0
    ? ((conv.revenue || 0) / data.current.visitors)
    : 0;

  return (
    <>
      <Head>
        <title>{data.site?.name || 'Analytics'} - Traffic Source</title>
      </Head>
      <DashboardLayout siteId={siteId} siteName={data.site?.name}>

        {/* ── Metrics Strip ── */}
        <MetricStrip metrics={[
          { label: 'Visitors', value: data.current.visitors, change: data.changes.visitors },
          { label: 'Revenue', value: conv.revenue || 0, format: 'currency' },
          { label: 'Conversion rate', value: conv.conversionRate || 0, format: 'percent' },
          { label: 'Revenue/visitor', value: Math.round(revenuePerVisitor), format: 'currency' },
          { label: 'Bounce rate', value: data.current.bounceRate, change: data.changes.bounceRate, format: 'percent' },
          { label: 'Session time', value: data.current.avgDuration, change: data.changes.avgDuration, format: 'duration' },
        ]} />

        {/* ── Combined Chart (visitors line + revenue bars) ── */}
        <div className="panel" style={{ marginBottom: 20 }}>
          <div className="chart-container">
            <CombinedChart
              trafficData={data.timeSeries}
              revenueData={data.conversions?.timeSeries || []}
            />
          </div>
        </div>

        {/* ── Sources + Geography (side by side) ── */}
        <div className="grid-2">
          <AnalyticsPanel
            tabs={[
              { key: 'referrer', label: 'Channel' },
              { key: 'utm_source', label: 'Referrer' },
              { key: 'utm_campaign', label: 'Campaign' },
            ]}
            data={{
              referrer: data.sources || [],
              utm_source: (data.sources || []).filter(s => s.name !== 'Direct'),
              utm_campaign: (data.sources || []).filter(s => s.name !== 'Direct'),
            }}
            valueKey="sessions"
            defaultTab="referrer"
          />

          <AnalyticsPanel
            tabs={[
              { key: 'country', label: 'Country' },
              { key: 'city', label: 'City' },
            ]}
            data={{
              country: data.countries || [],
              city: data.countries || [],
            }}
            defaultTab="country"
          />
        </div>

        {/* ── Pages + Browsers (side by side) ── */}
        <div className="grid-2">
          <AnalyticsPanel
            tabs={[
              { key: 'all', label: 'Page' },
              { key: 'entry', label: 'Entry page' },
              { key: 'exit', label: 'Exit page' },
            ]}
            data={{
              all: (data.pages || []).map(p => ({ ...p, count: p.views })),
              entry: (data.entryPages || []).map(p => ({ ...p, count: p.sessions })),
              exit: (data.exitPages || []).map(p => ({ ...p, count: p.sessions })),
            }}
            defaultTab="all"
          />

          <AnalyticsPanel
            tabs={[
              { key: 'browser', label: 'Browser' },
              { key: 'os', label: 'OS' },
              { key: 'device', label: 'Device' },
            ]}
            data={{
              browser: data.browsers || [],
              os: data.os || [],
              device: data.devices || [],
            }}
            defaultTab="browser"
          />
        </div>

        {/* ── Journey for Payment ── */}
        {data.conversions?.bySource?.length > 0 && (
          <div className="panel" style={{ marginBottom: 20 }}>
            <div className="panel-header">
              <div className="panel-tabs">
                <button className="panel-tab active">Journey for payment</button>
              </div>
            </div>
            <div className="panel-body" style={{ padding: 0 }}>
              <table className="journey-table">
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Conversions</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.conversions.bySource.map((row, i) => (
                    <tr key={i}>
                      <td>
                        <span style={{ fontWeight: 600 }}>{row.name}</span>
                      </td>
                      <td>{row.conversions}</td>
                      <td style={{ fontWeight: 600 }}>${((row.revenue || 0) / 100).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </DashboardLayout>
    </>
  );
}
