const express = require("express");
const router = express.Router();
const Violation = require("../models/Violation");

// ============================
// GET QUIZ QUESTIONS
// ============================
router.get("/questions", async (req, res) => {
  res.json([
    {
      question: "What is 2 + 2?",
      options: ["1", "2", "3", "4"]
    },
    {
      question: "Capital of India?",
      options: ["Delhi", "Mumbai", "Chennai", "Kolkata"]
    }
  ]);
});

// ============================
// LOG VIOLATIONS
// ============================
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
