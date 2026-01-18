const express = require("express");
const router = express.Router();

const Attempt = require("../models/Attempt");
const Violation = require("../models/Violation");

/* =========================
   LOG VIOLATION
========================= */
router.post("/violation", async (req, res) => {
  try {
    const { userId, reason } = req.body;

    if (!userId || !reason) {
      return res.status(400).json({ error: "Invalid violation data" });
    }

    // 🔴 Save violation log
    const violation = new Violation({
      userId,
      type: reason,
      autoDisqualified: false
    });
    await violation.save();

    // 🔴 Update latest attempt
    const attempt = await Attempt.findOne({ userId }).sort({ submitTime: -1 });

    if (!attempt) return res.json({ ignored: true });

    attempt.violations += 1;
    attempt.violationTypes.push(reason);

    // 🔴 Auto disqualify
    if (attempt.violations >= 3) {
      attempt.rankScore = -9999;
      violation.autoDisqualified = true;
      await violation.save();
    }

    await attempt.save();

    // 🔴 Live admin socket event
    req.app.get("io").emit("violation", {
      userId,
      reason
    });

    res.json({
      logged: true,
      violations: attempt.violations
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Violation logging failed" });
  }
});

module.exports = router;
