function toWorkspaceEntity(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    owner_id: row.owner_id != null ? row.owner_id : row.ownerId,
    created_at: row.created_at || row.createdAt || null,
    role: row.role || null,
  };
}

function toWorkspaceEntities(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map(toWorkspaceEntity);
}

module.exports = { toWorkspaceEntity, toWorkspaceEntities };

