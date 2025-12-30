const db = require('../database');

/**
 * Create a new workspace invitation
 */
async function createInvitation(workspaceId, inviteCode, role, createdBy, expiresAt, maxUses) {
  const query = `
    INSERT INTO workspace_invitations (workspace_id, invite_code, role, created_by, expires_at, max_uses)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  
  const result = await db.query(query, [workspaceId, inviteCode, role, createdBy, expiresAt, maxUses]);
  return result.rows[0];
}

/**
 * Get invitation by invite code
 */
async function getInvitationByCode(inviteCode) {
  const query = `
    SELECT i.*, w.name as workspace_name, w.slug as workspace_slug
    FROM workspace_invitations i
    JOIN workspaces w ON i.workspace_id = w.id
    WHERE i.invite_code = $1
  `;
  
  const result = await db.query(query, [inviteCode]);
  return result.rows[0];
}

/**
 * Get invitation by ID
 */
async function getInvitationById(invitationId) {
  const query = `
    SELECT i.*, w.name as workspace_name, w.slug as workspace_slug
    FROM workspace_invitations i
    JOIN workspaces w ON i.workspace_id = w.id
    WHERE i.id = $1
  `;
  
  const result = await db.query(query, [invitationId]);
  return result.rows[0];
}

/**
 * Get all invitations for a workspace
 */
async function getWorkspaceInvitations(workspaceId) {
  const query = `
    SELECT *
    FROM workspace_invitations
    WHERE workspace_id = $1
    ORDER BY created_at DESC
  `;
  
  const result = await db.query(query, [workspaceId]);
  return result.rows;
}

/**
 * Increment invitation uses count
 */
async function incrementInvitationUses(invitationId) {
  const query = `
    UPDATE workspace_invitations
    SET uses_count = uses_count + 1, updated_at = now()
    WHERE id = $1
    RETURNING *
  `;
  
  const result = await db.query(query, [invitationId]);
  return result.rows[0];
}

/**
 * Record invitation acceptance
 */
async function recordInvitationAcceptance(invitationId, userId) {
  const query = `
    INSERT INTO workspace_invitation_acceptances (invitation_id, user_id)
    VALUES ($1, $2)
    ON CONFLICT (invitation_id, user_id) DO NOTHING
    RETURNING *
  `;
  
  const result = await db.query(query, [invitationId, userId]);
  return result.rows[0];
}

/**
 * Check if user has already accepted an invitation
 */
async function hasUserAcceptedInvitation(invitationId, userId) {
  const query = `
    SELECT EXISTS (
      SELECT 1 FROM workspace_invitation_acceptances
      WHERE invitation_id = $1 AND user_id = $2
    ) as has_accepted
  `;
  
  const result = await db.query(query, [invitationId, userId]);
  return result.rows[0].has_accepted;
}

/**
 * Deactivate an invitation
 */
async function deactivateInvitation(invitationId) {
  const query = `
    UPDATE workspace_invitations
    SET is_active = false, updated_at = now()
    WHERE id = $1
    RETURNING *
  `;
  
  const result = await db.query(query, [invitationId]);
  return result.rows[0];
}

/**
 * Delete an invitation
 */
async function deleteInvitation(invitationId) {
  const query = `
    DELETE FROM workspace_invitations
    WHERE id = $1
  `;
  
  await db.query(query, [invitationId]);
}

/**
 * Get invitation acceptances (who accepted the invitation)
 */
async function getInvitationAcceptances(invitationId) {
  const query = `
    SELECT *
    FROM workspace_invitation_acceptances
    WHERE invitation_id = $1
    ORDER BY accepted_at DESC
  `;
  
  const result = await db.query(query, [invitationId]);
  return result.rows;
}

module.exports = {
  createInvitation,
  getInvitationByCode,
  getInvitationById,
  getWorkspaceInvitations,
  incrementInvitationUses,
  recordInvitationAcceptance,
  hasUserAcceptedInvitation,
  deactivateInvitation,
  deleteInvitation,
  getInvitationAcceptances,
};

