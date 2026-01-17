const express = require("express");
const router = express.Router();
const Violation = require("../models/Violation");

// TEMP quiz store (later from CSV / DB)
const QUESTIONS = [
  {
    id: 1,
    question: "What is 2 + 2?",
    options: ["1", "2", "3", "4"],
    correctAnswer: "4",
    marks: 1
  },
  {
    id: 2,
    question: "Capital of India?",
    options: ["Delhi", "Mumbai", "Chennai", "Kolkata"],
    correctAnswer: "Delhi",
    marks: 1
  }
];

// SEND QUESTIONS (NO ANSWERS)
router.get("/questions", (req, res) => {
  res.json(
    QUESTIONS.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
      marks: q.marks
    }))
  );
});

// SUBMIT QUIZ
router.post("/submit", async (req, res) => {
  const { answers, timePerQuestion, totalTime } = req.body;

  let score = 0;

  QUESTIONS.forEach(q => {
    if (answers[q.id] === q.correctAnswer) {
      score += q.marks;
    }
  });

  res.json({
    score,
    totalQuestions: QUESTIONS.length,
    totalTime,
    timePerQuestion
  });
});

module.exports = router;
