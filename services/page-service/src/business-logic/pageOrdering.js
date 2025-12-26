/**
 * Higher Order Function that creates page ordering functions
 * @param {Object} dataAccess - Data access functions object
 * @returns {Object} - Object containing page ordering functions
 */
function createPageOrdering(dataAccess) {
  const { getMaxPosition } = dataAccess;

  /**
   * Calculate the next position for a new page
   * @param {string} workspaceId - Workspace ID
   * @param {string|null} parentPageId - Parent page ID (null for root pages)
   * @returns {Promise<number>} - Next position number
   */
  async function calculateNewPosition(workspaceId, parentPageId) {
    const maxPosition = await getMaxPosition(workspaceId, parentPageId);
    return maxPosition + 1;
  }

  return {
    calculateNewPosition,
  };
}

module.exports = createPageOrdering;

