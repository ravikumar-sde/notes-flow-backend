/**
 * Higher Order Function that creates event service functions
 * @param {Object} events - Events client object
 * @returns {Object} - Object containing event service functions
 */
function createEventService(events) {
  const { publish } = events;

  /**
   * Publish workspace created event
   * @param {Object} workspace - Workspace object
   * @returns {Promise<void>}
   */
  async function publishWorkspaceCreated(workspace) {
    await publish('workspace.created', {
      workspaceId: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      ownerId: workspace.owner_id,
      createdAt: workspace.created_at,
    });
  }

  /**
   * Publish workspace updated event
   * @param {Object} workspace - Workspace object
   * @returns {Promise<void>}
   */
  async function publishWorkspaceUpdated(workspace) {
    await publish('workspace.updated', {
      workspaceId: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      ownerId: workspace.owner_id,
    });
  }

  /**
   * Publish workspace deleted event
   * @param {string} workspaceId - Workspace ID
   * @returns {Promise<void>}
   */
  async function publishWorkspaceDeleted(workspaceId) {
    await publish('workspace.deleted', {
      workspaceId,
    });
  }

  /**
   * Publish member added event
   * @param {string} workspaceId - Workspace ID
   * @param {string} userId - User ID
   * @param {string} role - User role
   * @returns {Promise<void>}
   */
  async function publishMemberAdded(workspaceId, userId, role) {
    await publish('workspace.member.added', {
      workspaceId,
      userId,
      role,
    });
  }

  /**
   * Publish invitation created event
   * @param {Object} invitation - Invitation object
   * @returns {Promise<void>}
   */
  async function publishInvitationCreated(invitation) {
    await publish('workspace.invitation.created', {
      invitationId: invitation.id,
      workspaceId: invitation.workspace_id,
      inviteCode: invitation.invite_code,
      role: invitation.role,
      createdBy: invitation.created_by,
      expiresAt: invitation.expires_at,
      maxUses: invitation.max_uses,
    });
  }

  /**
   * Publish invitation accepted event
   * @param {Object} invitation - Invitation object
   * @param {string} userId - User ID who accepted
   * @returns {Promise<void>}
   */
  async function publishInvitationAccepted(invitation, userId) {
    await publish('workspace.invitation.accepted', {
      invitationId: invitation.id,
      workspaceId: invitation.workspace_id,
      userId,
      role: invitation.role,
    });
  }

  /**
   * Publish invitation deactivated event
   * @param {Object} invitation - Invitation object
   * @returns {Promise<void>}
   */
  async function publishInvitationDeactivated(invitation) {
    await publish('workspace.invitation.deactivated', {
      invitationId: invitation.id,
      workspaceId: invitation.workspace_id,
    });
  }

  /**
   * Publish invitation deleted event
   * @param {string} invitationId - Invitation ID
   * @param {string} workspaceId - Workspace ID
   * @returns {Promise<void>}
   */
  async function publishInvitationDeleted(invitationId, workspaceId) {
    await publish('workspace.invitation.deleted', {
      invitationId,
      workspaceId,
    });
  }

  return {
    publishWorkspaceCreated,
    publishWorkspaceUpdated,
    publishWorkspaceDeleted,
    publishMemberAdded,
    publishInvitationCreated,
    publishInvitationAccepted,
    publishInvitationDeactivated,
    publishInvitationDeleted,
  };
}

module.exports = createEventService;

