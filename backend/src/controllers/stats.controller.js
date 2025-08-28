const { createFileService } = require("../utils/fileService");
const cache = require("../utils/cache");

const STATS_CACHE_KEY = "stats";
const fileService = createFileService("items.json");

async function getStats(_, res, next) {
  try {
    const cachedStats = cache.get(STATS_CACHE_KEY);

    if (cachedStats) {
      return res.json(cachedStats);
    }

    const items = await fileService.readData();

    const stats = {
      total: items.length,
      averagePrice:
        items.reduce((acc, cur) => acc + cur.price, 0) / items.length,
    };

    // Cache the computed stats
    cache.set(STATS_CACHE_KEY, stats);

    res.json(stats);
  } catch (err) {
    next(err);
  }
}

module.exports = { getStats };
