function toUserEntity(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    name: row.name || null,
    created_at: row.created_at || row.createdAt || null,
  };
}

module.exports = { toUserEntity };

