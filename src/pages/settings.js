import { useState } from 'react';
import Head from 'next/head';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    // Profile update could be added via API
    setMessage('Profile updated');
  };

  return (
    <>
      <Head>
        <title>Settings - Traffic Source</title>
      </Head>
      <DashboardLayout>
        <div style={{ maxWidth: 600 }}>
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <h3>Profile</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {message && (
                  <div style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '10px 14px', borderRadius: 'var(--radius)', fontSize: 13 }}>
                    {message}
                  </div>
                )}
                {error && <div className="auth-error">{error}</div>}
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
                </div>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                  Save Changes
                </button>
              </form>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <h3>Stripe Integration</h3>
            </div>
            <div className="card-body">
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                Configure your Stripe webhook to receive conversion events.
              </p>
              <div className="form-group">
                <label>Webhook URL</label>
                <div className="snippet-block" style={{ fontSize: 13 }}>
                  {appUrl}/api/stripe/webhook
                </div>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                Add this URL in your Stripe Dashboard under Developers &gt; Webhooks.
                Listen for <code>checkout.session.completed</code> and <code>charge.refunded</code> events.
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
