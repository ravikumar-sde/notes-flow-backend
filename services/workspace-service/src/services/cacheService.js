/**
 * Higher Order Function that creates cache service functions
 * @param {Object} cache - Cache client object
 * @param {Object} config - Configuration object
 * @returns {Object} - Object containing cache service functions
 */
function createCacheService(cache, config) {
  const { getRedisClient } = cache;

  /**
   * Get cached workspaces for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array|null>} - Cached workspaces or null
   */
  async function getCachedWorkspaces(userId) {
    const redis = getRedisClient();
    const cacheKey = `user:${userId}:workspaces`;
    const cached = await redis.get(cacheKey);
    return cached ? JSON.parse(cached) : null;
  }

  /**
   * Set cached workspaces for a user
   * @param {string} userId - User ID
   * @param {Array} workspaces - Workspaces to cache
   * @returns {Promise<void>}
   */
  async function setCachedWorkspaces(userId, workspaces) {
    const redis = getRedisClient();
    const cacheKey = `user:${userId}:workspaces`;
    await redis.setex(
      cacheKey,
      config.workspaceCacheTtlSeconds,
      JSON.stringify(workspaces)
    );
  }

  /**
   * Invalidate workspace cache for a user
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async function invalidateUserCache(userId) {
    const redis = getRedisClient();
    const cacheKey = `user:${userId}:workspaces`;
    await redis.del(cacheKey);
  }

  /**
   * Invalidate workspace cache for multiple users
   * @param {Array} userIds - Array of user IDs
   * @returns {Promise<void>}
   */
  async function invalidateMultipleUserCaches(userIds) {
    const redis = getRedisClient();
    for (const userId of userIds) {
      const cacheKey = `user:${userId}:workspaces`;
      await redis.del(cacheKey);
    }
  }

  return {
    getCachedWorkspaces,
    setCachedWorkspaces,
    invalidateUserCache,
    invalidateMultipleUserCaches,
  };
}

module.exports = createCacheService;

