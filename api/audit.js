const express = require("express");
const router = express.Router();

// Example static directives for audit
const directives = [
  { id: 1, text: "Verify your node identity." },
  { id: 2, text: "Confirm your device location." },
  { id: 3, text: "Acknowledge the DNA-001 contract." },
];

// GET /api/audit/directives
router.get("/directives", (req, res) => {
  res.json({ directives });
});

module.exports = router;
