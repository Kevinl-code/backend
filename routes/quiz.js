const express = require("express");
const router = express.Router();

const Question = require("../models/Question");
const Attempt = require("../models/Attempt");
const Violation = require("../models/Violation");

/* ======================================================
   GET QUESTIONS (NO CORRECT ANSWERS SENT)
====================================================== */
router.get("/questions", async (req, res) => {
  const questions = await Question.find({}, {
    correctAnswer: 0,
    __v: 0
  });

  res.json(questions);
});

/* ======================================================
   SUBMIT QUIZ + SCORE + LOG ATTEMPT
====================================================== */
router.post("/submit", async (req, res) => {
  const {
    userId,
    name,
    answers,           // { questionId: selectedOption }
    timePerQuestion,   // { questionId: seconds }
    totalTime
  } = req.body;

  const questions = await Question.find();
  let score = 0;

  questions.forEach(q => {
    if (answers[q._id] === q.correctAnswer) {
      score += q.marks;
    }
  });

  /* ===== VIOLATION DATA ===== */
   const violationDocs = await Violation.find({ userId });
   const violations = violationDocs.length;
   const violationTypes = violationDocs.map(v => v.type);

/* ===== AUTO DISQUALIFY ===== */
   const autoDisqualified = violations >= 3;

/* ===== RANK SCORE ===== */
   const rankScore = autoDisqualified
     ? -9999
     : score * 100 - violations * 50 - totalTime;

/* ===== SAVE ATTEMPT ===== */
   await Attempt.create({
     userId,
     name,
     loginTime: new Date(Date.now() - totalTime * 1000),
     submitTime: new Date(),
     score,
     totalTime,
     timePerQuestion,
     violations,
     violationTypes,
     rankScore
   });

  res.json({
    success: true,
    score,
    totalQuestions: questions.length,
    totalTime,
    violations
  });
});

module.exports = router;

