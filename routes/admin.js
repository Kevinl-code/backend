const express = require("express");
const router = express.Router();
const Violation = require("../models/Violation");

router.get("/violations", async (req, res) => {
  const logs = await Violation.find().sort({ timestamp: -1 });
  res.json(logs);
});

router.post("/allow", async (req, res) => {
  await Violation.deleteMany({ userId: req.body.userId });
  res.json({ status: "allowed" });
});

module.exports = router;
