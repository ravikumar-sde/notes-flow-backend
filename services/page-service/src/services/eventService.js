/**
 * Higher Order Function that creates event service functions
 * @param {Object} events - Events client object
 * @returns {Object} - Object containing event service functions
 */
function createEventService(events) {
  const { publish } = events;

  /**
   * Publish page created event
   * @param {Object} page - Page object
   * @returns {Promise<void>}
   */
  async function publishPageCreated(page) {
    await publish('page.created', {
      pageId: page.id,
      workspaceId: page.workspace_id,
      parentPageId: page.parent_page_id,
      title: page.title,
      createdBy: page.created_by,
      createdAt: page.created_at,
    });
  }

  /**
   * Publish page updated event
   * @param {Object} page - Page object
   * @returns {Promise<void>}
   */
  async function publishPageUpdated(page) {
    await publish('page.updated', {
      pageId: page.id,
      workspaceId: page.workspace_id,
      title: page.title,
      updatedBy: page.last_edited_by,
      updatedAt: page.updated_at,
    });
  }

  /**
   * Publish page deleted event
   * @param {string} pageId - Page ID
   * @param {string} workspaceId - Workspace ID
   * @param {string} deletedBy - User ID who deleted the page
   * @returns {Promise<void>}
   */
  async function publishPageDeleted(pageId, workspaceId, deletedBy) {
    await publish('page.deleted', {
      pageId,
      workspaceId,
      deletedBy,
      deletedAt: new Date().toISOString(),
    });
  }

  /**
   * Publish page archived event
   * @param {Object} page - Page object
   * @returns {Promise<void>}
   */
  async function publishPageArchived(page) {
    await publish('page.archived', {
      pageId: page.id,
      workspaceId: page.workspace_id,
      isArchived: page.is_archived,
      archivedBy: page.last_edited_by,
      archivedAt: page.updated_at,
    });
  }

  /**
   * Publish page moved event
   * @param {Object} page - Page object
   * @param {string|null} oldParentId - Old parent page ID
   * @returns {Promise<void>}
   */
  async function publishPageMoved(page, oldParentId) {
    await publish('page.moved', {
      pageId: page.id,
      workspaceId: page.workspace_id,
      oldParentId,
      newParentId: page.parent_page_id,
      movedBy: page.last_edited_by,
      movedAt: page.updated_at,
    });
  }

  return {
    publishPageCreated,
    publishPageUpdated,
    publishPageDeleted,
    publishPageArchived,
    publishPageMoved,
  };
}

module.exports = createEventService;

