const express = require("express");
const router = express.Router();
const {
  getItems,
  getItemById,
  addItem,
} = require("../controllers/items.controller");

// GET /api/items
router.get("/", getItems);

// GET /api/items/:id
router.get("/:id", getItemById);

// POST /api/items
router.post("/", addItem);

module.exports = router;
