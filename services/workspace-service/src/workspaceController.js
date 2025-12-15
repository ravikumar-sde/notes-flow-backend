const db = require('./db');
const config = require('./config');
const { getRedisClient } = require('./redisClient');
const { publish } = require('./natsClient');

function slugify(input) {
  return input
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function createWorkspace(req, res) {
  const userId = req.headers['x-user-id'];
  const { name } = req.body || {};

  if (!userId) {
    return res.status(401).json({ message: 'Missing x-user-id header' });
  }

  if (!name) {
    return res.status(400).json({ message: 'Workspace name is required' });
  }

  try {
    let baseSlug = slugify(name);
    if (!baseSlug) {
      baseSlug = `workspace-${Date.now()}`;
    }

    let slug = baseSlug;
    let attempts = 0;
    // simple uniqueness loop, max 5 attempts
    while (attempts < 5) {
      const existing = await db.query(
        'SELECT id FROM workspaces WHERE slug = $1',
        [slug]
      );
      if (existing.rowCount === 0) break;
      attempts += 1;
      slug = `${baseSlug}-${attempts}`;
    }

    const wsRes = await db.query(
      'INSERT INTO workspaces (name, slug, owner_id) VALUES ($1, $2, $3) RETURNING id, name, slug, owner_id, created_at',
      [name, slug, userId]
    );

    const workspace = wsRes.rows[0];

    await db.query(
      'INSERT INTO workspace_memberships (workspace_id, user_id, role) VALUES ($1, $2, $3)',
      [workspace.id, userId, 'owner']
    );

    const redis = getRedisClient();
    const cacheKey = `user:${userId}:workspaces`;
    await redis.del(cacheKey);

    await publish('workspace.created', {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      ownerId: workspace.owner_id,
    });

    return res.status(201).json({ workspace });
  } catch (err) {
    console.error('Error creating workspace', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function listWorkspacesForUser(req, res) {
  const userId = req.headers['x-user-id'];

  if (!userId) {
    return res.status(401).json({ message: 'Missing x-user-id header' });
  }

  try {
    const redis = getRedisClient();
    const cacheKey = `user:${userId}:workspaces`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return res.json({ workspaces: JSON.parse(cached), source: 'cache' });
    }

    const result = await db.query(
      `SELECT w.id, w.name, w.slug, w.owner_id, w.created_at, m.role
       FROM workspaces w
       JOIN workspace_memberships m ON m.workspace_id = w.id
       WHERE m.user_id = $1
       ORDER BY w.created_at ASC`,
      [userId]
    );

    const workspaces = result.rows;

    await redis.setex(
      cacheKey,
      config.workspaceCacheTtlSeconds,
      JSON.stringify(workspaces)
    );

    return res.json({ workspaces, source: 'db' });
  } catch (err) {
    console.error('Error listing workspaces', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  createWorkspace,
  listWorkspacesForUser,
};

