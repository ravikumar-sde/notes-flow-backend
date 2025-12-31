function createCacheService(cache, config) {
  const { getRedisClient } = cache;
  async function getCachedPage(pageId) {
    const redis = getRedisClient();
    const cacheKey = `page:${pageId}`;
    const cached = await redis.get(cacheKey);
    return cached ? JSON.parse(cached) : null;
  }

  async function setCachedPage(pageId, page) {
    const redis = getRedisClient();
    const cacheKey = `page:${pageId}`;
    await redis.setex(
      cacheKey,
      config.pageCacheTtlSeconds,
      JSON.stringify(page)
    );
  }

  async function getCachedWorkspacePages(workspaceId) {
    const redis = getRedisClient();
    const cacheKey = `workspace:${workspaceId}:pages`;
    const cached = await redis.get(cacheKey);
    return cached ? JSON.parse(cached) : null;
  }

  async function setCachedWorkspacePages(workspaceId, pages) {
    const redis = getRedisClient();
    const cacheKey = `workspace:${workspaceId}:pages`;
    await redis.setex(
      cacheKey,
      config.pageCacheTtlSeconds,
      JSON.stringify(pages)
    );
  }

  async function getCachedChildPages(pageId) {
    const redis = getRedisClient();
    const cacheKey = `page:${pageId}:children`;
    const cached = await redis.get(cacheKey);
    return cached ? JSON.parse(cached) : null;
  }

  async function setCachedChildPages(pageId, children) {
    const redis = getRedisClient();
    const cacheKey = `page:${pageId}:children`;
    await redis.setex(
      cacheKey,
      config.pageCacheTtlSeconds,
      JSON.stringify(children)
    );
  }

  async function invalidatePageCache(pageId) {
    const redis = getRedisClient();
    const cacheKey = `page:${pageId}`;
    await redis.del(cacheKey);
  }

  async function invalidateWorkspaceCache(workspaceId) {
    const redis = getRedisClient();
    const cacheKey = `workspace:${workspaceId}:pages`;
    await redis.del(cacheKey);
  }

  async function invalidateChildPagesCache(pageId) {
    const redis = getRedisClient();
    const cacheKey = `page:${pageId}:children`;
    await redis.del(cacheKey);
  }

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

