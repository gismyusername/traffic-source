import { getDb } from '@/lib/db';
import { withAuth } from '@/lib/withAuth';

export default withAuth(function handler(req, res) {
  const db = getDb();
  const { id } = req.query;

  const site = db
    .prepare('SELECT * FROM sites WHERE id = ? AND user_id = ?')
    .get(id, req.user.userId);

  if (!site) {
    return res.status(404).json({ error: 'Site not found' });
  }

  if (req.method === 'GET') {
    return res.status(200).json({ site });
  }

  if (req.method === 'PUT') {
    const { domain, name } = req.body;
    const cleanDomain = domain
      ? domain.replace(/^https?:\/\//, '').replace(/\/+$/, '')
      : site.domain;

    db.prepare('UPDATE sites SET domain = ?, name = ? WHERE id = ?').run(
      cleanDomain,
      name || site.name,
      id
    );

    const updated = db.prepare('SELECT * FROM sites WHERE id = ?').get(id);
    return res.status(200).json({ site: updated });
  }

  if (req.method === 'DELETE') {
    db.prepare('DELETE FROM sites WHERE id = ?').run(id);
    return res.status(200).json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
});
