const { createFileService } = require("../utils/fileService");
const cache = require("../utils/cache");

const STATS_CACHE_KEY = "stats";
const fileService = createFileService("items.json");

async function getItems(req, res, next) {
  try {
    const data = await fileService.readData();
    const { q, limit: strLimit, page: strPage } = req.query;
    let results = data;

    if (q) {
      // Simple substring search (sub‑optimal)
      results = results.filter((item) =>
        item.name.toLowerCase().includes(q.toLowerCase())
      );
    }

    const limit = parseInt(strLimit, 10);
    const page = parseInt(strPage, 10) || 1;

    if (!isNaN(limit) && limit > 0) {
      const start = (page - 1) * limit;
      const end = start + limit;
      results = results.slice(start, end);
    }

    res.json(results);
  } catch (err) {
    next(err);
  }
}

async function getItemById(req, res, next) {
  try {
    const data = await fileService.readData();
    const item = data.find((i) => i.id === parseInt(req.params.id));
    if (!item) {
      const err = new Error("Item not found");
      err.status = 404;
      throw err;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function addItem(req, res, next) {
  try {
    const item = req.body;

    // Throws an error with 400 status if validation fails
    _validateItem(item);

    const data = await fileService.readData();
    item.id = Date.now();

    data.push(item);

    await fileService.writeData(data);

    // Invalidate the stats cache
    cache.clear(STATS_CACHE_KEY);

    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

// TODO: More robust validation using a library like Zod, Joi, etc.
// or separating and making logic reusable
// TODO: Implement custom errors for better error handling
function _validateItem(item) {
  if (!item || typeof item !== "object") {
    const err = new Error("Invalid item");
    err.status = 400;
    throw err;
  }

  if (!item.name || typeof item.name !== "string") {
    const err = new Error("Invalid item 'name'");
    err.status = 400;
    throw err;
  }

  if (!item.category || typeof item.category !== "string") {
    const err = new Error("Invalid item 'category'");
    err.status = 400;
    throw err;
  }

  if (item.price == null || typeof item.price !== "number" || item.price < 0) {
    const err = new Error("Invalid item 'price'");
    err.status = 400;
    throw err;
  }
}

module.exports = { getItems, getItemById, addItem };
