const express = require("express");
const router = express.Router();
const Violation = require("../models/Violation");

router.post("/violation", async (req, res) => {
  const { userId, type } = req.body;

  const count = await Violation.countDocuments({ userId });

  const disqualify = count >= 3;

  await Violation.create({
    userId,
    type,
    autoDisqualified: disqualify
  });

  res.json({
    status: "logged",
    disqualified: disqualify
  });
});

module.exports = router;
