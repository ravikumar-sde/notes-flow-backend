/**
 * Higher Order Function that creates slug generator functions
 * @param {Object} utils - Utility functions object
 * @param {Object} dataAccess - Data access functions object
 * @returns {Object} - Object containing slug generator functions
 */
function createSlugGenerator(utils, dataAccess) {
  const { slugify } = utils;
  const { checkSlugExists, checkSlugExistsExcludingId } = dataAccess;

  /**
   * Generate a unique slug for a new workspace
   * @param {string} name - Workspace name
   * @returns {Promise<string>} - Unique slug
   */
  async function generateUniqueSlug(name) {
    let baseSlug = slugify(name);
    if (!baseSlug) {
      baseSlug = `workspace-${Date.now()}`;
    }

    let slug = baseSlug;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      const exists = await checkSlugExists(slug);
      if (!exists) {
        break;
      }
      attempts += 1;
      slug = `${baseSlug}-${attempts}`;
    }

    return slug;
  }

  /**
   * Generate a unique slug for updating a workspace
   * @param {string} name - Workspace name
   * @param {string} workspaceId - Workspace ID to exclude from uniqueness check
   * @returns {Promise<string>} - Unique slug
   */
  async function generateUniqueSlugForUpdate(name, workspaceId) {
    let baseSlug = slugify(name);
    if (!baseSlug) {
      baseSlug = `workspace-${Date.now()}`;
    }

    let slug = baseSlug;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      const exists = await checkSlugExistsExcludingId(slug, workspaceId);
      if (!exists) {
        break;
      }
      attempts += 1;
      slug = `${baseSlug}-${attempts}`;
    }

    return slug;
  }

  return {
    generateUniqueSlug,
    generateUniqueSlugForUpdate,
  };
}

module.exports = createSlugGenerator;

