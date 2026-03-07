import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import DashboardLayout from '@/components/layout/DashboardLayout';
import MetricStrip from '@/components/ui/MetricStrip';
import TimeSeriesChart from '@/components/charts/TimeSeriesChart';
import { useDateRange } from '@/contexts/DateRangeContext';

export default function AffiliateDetail() {
  const router = useRouter();
  const { siteId, affiliateId } = router.query;
  const { getParams } = useDateRange();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!siteId || !affiliateId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams(getParams());
      const res = await fetch(`/api/analytics/${siteId}/affiliates/${affiliateId}?${params}`);
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, [siteId, affiliateId, JSON.stringify(getParams())]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const copyLink = () => {
    if (!data) return;
    const domain = data.site?.domain || 'yoursite.com';
    navigator.clipboard.writeText(`https://${domain}?ref=${data.affiliate.slug}`);
  };

  if (loading || !data) {
    return (
      <>
        <Head><title>Affiliate - Traffic Source</title></Head>
        <DashboardLayout siteId={siteId}>
          <div className="loading-inline"><div className="loading-spinner" /></div>
        </DashboardLayout>
      </>
    );
  }

  const { affiliate, stats } = data;

  return (
    <>
      <Head>
        <title>{affiliate.name} - Affiliates - Traffic Source</title>
      </Head>
      <DashboardLayout siteId={siteId} siteName={data.site?.name} siteDomain={data.site?.domain}>
        <div className="page-nav" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => router.push(`/analytics/${siteId}/affiliates`)}
          >
            &larr; Affiliates
          </button>
          <h2 className="page-title" style={{ margin: 0 }}>{affiliate.name}</h2>
          <code style={{ fontSize: 12, color: 'var(--text-muted)' }}>ref={affiliate.slug}</code>
        </div>

        {/* Metrics */}
        <MetricStrip metrics={[
          { label: 'Visits', value: stats.visits },
          { label: 'Unique Visitors', value: stats.uniqueVisitors },
          { label: 'Conversions', value: stats.conversions },
          { label: 'Revenue', value: stats.revenue, format: 'currency' },
          { label: 'Conversion Rate', value: stats.conversionRate, format: 'percent' },
          ...(affiliate.commission_rate > 0
            ? [{ label: `Commission (${(affiliate.commission_rate * 100).toFixed(0)}%)`, value: stats.commission, format: 'currency' }]
            : []),
        ]} />

        {/* Referral Link */}
        <div className="panel" style={{ marginBottom: 20 }}>
          <div className="panel-header">
            <div className="panel-tabs">
              <button className="panel-tab active">Referral Link</button>
            </div>
          </div>
          <div className="panel-body" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
            <code style={{ flex: 1, fontSize: 13, padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              https://{data.site?.domain}?ref={affiliate.slug}
            </code>
            <button className="btn btn-primary btn-sm" onClick={copyLink}>Copy</button>
          </div>
        </div>

        {/* Visits Chart */}
        {data.visitTimeSeries?.length > 0 && (
          <div className="panel" style={{ marginBottom: 20 }}>
            <div className="panel-header">
              <div className="panel-tabs">
                <button className="panel-tab active">Visits Over Time</button>
              </div>
            </div>
            <div className="panel-body chart-container">
              <TimeSeriesChart
                data={data.visitTimeSeries}
                dataKey="visits"
                label="Visits"
              />
            </div>
          </div>
        )}

        {/* Top Landing Pages */}
        {data.landingPages?.length > 0 && (
          <div className="panel" style={{ marginBottom: 20 }}>
            <div className="panel-header">
              <div className="panel-tabs">
                <button className="panel-tab active">Top Landing Pages</button>
              </div>
            </div>
            <div className="panel-body" style={{ padding: 0 }}>
              <table className="journey-table">
                <thead>
                  <tr>
                    <th>Page</th>
                    <th>Visits</th>
                  </tr>
                </thead>
                <tbody>
                  {data.landingPages.map((p, i) => (
                    <tr key={i}>
                      <td>{p.name}</td>
                      <td>{p.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Conversions */}
        {data.conversions?.length > 0 && (
          <div className="panel" style={{ marginBottom: 20 }}>
            <div className="panel-header">
              <div className="panel-tabs">
                <button className="panel-tab active">Conversions</button>
              </div>
            </div>
            <div className="panel-body" style={{ padding: 0 }}>
              <table className="journey-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Email</th>
                    <th>Amount</th>
                    <th>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {data.conversions.map((c) => (
                    <tr key={c.id}>
                      <td>{new Date(c.created_at).toLocaleDateString()}</td>
                      <td>{c.stripe_customer_email || c.visitor_id?.slice(0, 8)}</td>
                      <td style={{ fontWeight: 600 }}>${(c.amount / 100).toFixed(2)}</td>
                      <td>{c.utm_source || c.referrer_domain || 'Direct'}</td>
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
