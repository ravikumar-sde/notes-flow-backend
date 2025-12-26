/**
 * Higher Order Function that creates cache service functions
 * @param {Object} cache - Cache client object
 * @param {Object} config - Configuration object
 * @returns {Object} - Object containing cache service functions
 */
function createCacheService(cache, config) {
  const { getRedisClient } = cache;

  /**
   * Get cached page by ID
   * @param {string} pageId - Page ID
   * @returns {Promise<Object|null>} - Cached page or null
   */
  async function getCachedPage(pageId) {
    const redis = getRedisClient();
    const cacheKey = `page:${pageId}`;
    const cached = await redis.get(cacheKey);
    return cached ? JSON.parse(cached) : null;
  }

  /**
   * Set cached page
   * @param {string} pageId - Page ID
   * @param {Object} page - Page object to cache
   * @returns {Promise<void>}
   */
  async function setCachedPage(pageId, page) {
    const redis = getRedisClient();
    const cacheKey = `page:${pageId}`;
    await redis.setex(
      cacheKey,
      config.pageCacheTtlSeconds,
      JSON.stringify(page)
    );
  }

  /**
   * Get cached workspace pages
   * @param {string} workspaceId - Workspace ID
   * @returns {Promise<Array|null>} - Cached pages or null
   */
  async function getCachedWorkspacePages(workspaceId) {
    const redis = getRedisClient();
    const cacheKey = `workspace:${workspaceId}:pages`;
    const cached = await redis.get(cacheKey);
    return cached ? JSON.parse(cached) : null;
  }

  /**
   * Set cached workspace pages
   * @param {string} workspaceId - Workspace ID
   * @param {Array} pages - Pages array to cache
   * @returns {Promise<void>}
   */
  async function setCachedWorkspacePages(workspaceId, pages) {
    const redis = getRedisClient();
    const cacheKey = `workspace:${workspaceId}:pages`;
    await redis.setex(
      cacheKey,
      config.pageCacheTtlSeconds,
      JSON.stringify(pages)
    );
  }

  /**
   * Get cached child pages
   * @param {string} pageId - Parent page ID
   * @returns {Promise<Array|null>} - Cached child pages or null
   */
  async function getCachedChildPages(pageId) {
    const redis = getRedisClient();
    const cacheKey = `page:${pageId}:children`;
    const cached = await redis.get(cacheKey);
    return cached ? JSON.parse(cached) : null;
  }

  /**
   * Set cached child pages
   * @param {string} pageId - Parent page ID
   * @param {Array} children - Child pages array to cache
   * @returns {Promise<void>}
   */
  async function setCachedChildPages(pageId, children) {
    const redis = getRedisClient();
    const cacheKey = `page:${pageId}:children`;
    await redis.setex(
      cacheKey,
      config.pageCacheTtlSeconds,
      JSON.stringify(children)
    );
  }

  /**
   * Invalidate page cache
   * @param {string} pageId - Page ID
   * @returns {Promise<void>}
   */
  async function invalidatePageCache(pageId) {
    const redis = getRedisClient();
    const cacheKey = `page:${pageId}`;
    await redis.del(cacheKey);
  }

  /**
   * Invalidate workspace pages cache
   * @param {string} workspaceId - Workspace ID
   * @returns {Promise<void>}
   */
  async function invalidateWorkspaceCache(workspaceId) {
    const redis = getRedisClient();
    const cacheKey = `workspace:${workspaceId}:pages`;
    await redis.del(cacheKey);
  }

  /**
   * Invalidate child pages cache
   * @param {string} pageId - Parent page ID
   * @returns {Promise<void>}
   */
  async function invalidateChildPagesCache(pageId) {
    const redis = getRedisClient();
    const cacheKey = `page:${pageId}:children`;
    await redis.del(cacheKey);
  }

  /**
   * Invalidate all caches related to a page
   * @param {string} pageId - Page ID
   * @param {string} workspaceId - Workspace ID
   * @param {string|null} parentPageId - Parent page ID
   * @returns {Promise<void>}
   */
  async function invalidateAllPageCaches(pageId, workspaceId, parentPageId) {
    await invalidatePageCache(pageId);
    await invalidateWorkspaceCache(workspaceId);
    if (parentPageId) {
      await invalidateChildPagesCache(parentPageId);
    }
  }

  return {
    getCachedPage,
    setCachedPage,
    getCachedWorkspacePages,
    setCachedWorkspacePages,
    getCachedChildPages,
    setCachedChildPages,
    invalidatePageCache,
    invalidateWorkspaceCache,
    invalidateChildPagesCache,
    invalidateAllPageCaches,
  };
}

module.exports = createCacheService;

