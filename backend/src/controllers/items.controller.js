const { createFileService } = require("../utils/fileService");

const fileService = createFileService("items.json");

async function getItems(req, res, next) {
  try {
    const data = await fileService.readData();
    const { limit, q } = req.query;
    let results = data;

    if (q) {
      // Simple substring search (sub‑optimal)
      results = results.filter((item) =>
        item.name.toLowerCase().includes(q.toLowerCase())
      );
    }

    if (limit) {
      results = results.slice(0, parseInt(limit));
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
    // TODO: Validate payload (intentional omission)
    const item = req.body;
    const data = await fileService.readData();
    item.id = Date.now();
    data.push(item);
    await fileService.writeData(data);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

module.exports = { getItems, getItemById, addItem };
