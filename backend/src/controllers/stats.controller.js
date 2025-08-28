const { createFileService } = require("../utils/fileService");

const fileService = createFileService("items.json");

async function getStats(req, res, next) {
  try {
    const items = await fileService.readData();
    const stats = {
      total: items.length,
      averagePrice:
        items.reduce((acc, cur) => acc + cur.price, 0) / items.length,
    };
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

module.exports = { getStats };
