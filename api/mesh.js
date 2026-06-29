const express = require("express");
const router = express.Router();

// In-memory mesh node registry (shared with mesh-nodes.js if needed)
const nodes = [];

// GET /api/mesh/nodes
router.get("/nodes", (req, res) => {
  res.json({ nodes });
});

// POST /api/mesh/nodes (register a new node)
router.post("/nodes", (req, res) => {
  const node = req.body;
  node.timestamp = Date.now();
  nodes.push(node);
  res.status(201).json({ success: true, node });
});

module.exports = router;
