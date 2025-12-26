const cache = require('../cache');
const config = require('../config');
const events = require('../events');
const createCacheService = require('./cacheService');
const createEventService = require('./eventService');

const cacheService = createCacheService(cache, config);
const eventService = createEventService(events);

module.exports = {
  ...cacheService,
  ...eventService,
};

