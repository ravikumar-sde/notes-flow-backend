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

  return {
    publishWorkspaceCreated,
    publishWorkspaceUpdated,
    publishWorkspaceDeleted,
  };
}

module.exports = createEventService;

