const express = require("express");
const router = express.Router();

const Violation = require("../models/Violation");

/* =========================
   LOG VIOLATION (ONLY LOG)
========================= */
router.post("/violation", async (req, res) => {
  try {
    const { userId, reason } = req.body;

    if (!userId || !reason) {
      return res.status(400).json({ error: "Invalid violation data" });
    }

    const violation = new Violation({
      userId,
      type: reason,
      autoDisqualified: false
    });

    await violation.save();

    // 🔴 Live admin socket
    req.app.get("io").emit("violation", {
      userId,
      reason
    });

    res.json({ logged: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Violation logging failed" });
  }
});

module.exports = router;
