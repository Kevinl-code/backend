const express = require("express");
const router = express.Router();
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");

const Question = require("../models/Question");
const Attempt = require("../models/Attempt");

/* ===========================
   ENSURE UPLOADS FOLDER
=========================== */
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

/* ===========================
   CSV UPLOAD CONFIG
=========================== */
const upload = multer({
  dest: uploadDir
});

/* ===========================
   1️⃣ UPLOAD QUESTIONS CSV
   field name MUST be "csv"
=========================== */
router.post("/upload-questions", upload.single("csv"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No CSV file uploaded" });
    }

    const questions = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", row => {
        questions.push({
          question: row.question,
          options: [
            row.option1,
            row.option2,
            row.option3,
            row.option4
          ],
          correctAnswer: row.correctAnswer,
          marks: Number(row.marks) || 1
        });
      })
      .on("end", async () => {
        await Question.deleteMany({});
        await Question.insertMany(questions);

        fs.unlinkSync(req.file.path);

        res.json({
          success: true,
          message: "Questions uploaded successfully",
          totalQuestions: questions.length
        });
      });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "CSV upload failed" });
  }
});

/* ===========================
   2️⃣ FETCH LEADERBOARD
=========================== */
router.get("/leaderboard", async (req, res) => {
  try {
    const leaderboard = await Attempt.find()
      .sort({ rankScore: -1 })
      .limit(50);

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: "Leaderboard fetch failed" });
  }
});

/* ===========================
   3️⃣ ALL STUDENT ATTEMPTS
=========================== */
router.get("/attempts", async (req, res) => {
  try {
    const attempts = await Attempt.find().sort({ submitTime: -1 });
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch attempts" });
  }
});

/* ===========================
   4️⃣ SINGLE STUDENT DETAILS
=========================== */
router.get("/student/:id", async (req, res) => {
  try {
    const attempt = await Attempt.findOne({ userId: req.params.id });
    res.json(attempt);
  } catch (err) {
    res.status(500).json({ error: "Student not found" });
  }
});

/* ===========================
   5️⃣ MANUAL DISQUALIFY
=========================== */
router.post("/disqualify/:id", async (req, res) => {
  try {
    const attempt = await Attempt.findOne({ userId: req.params.id });

    if (!attempt) {
      return res.status(404).json({ error: "Attempt not found" });
    }

    attempt.rankScore = -9999;
    await attempt.save();

    res.json({ success: true, message: "Student disqualified" });
  } catch (err) {
    res.status(500).json({ error: "Disqualify failed" });
  }
});

module.exports = router;
