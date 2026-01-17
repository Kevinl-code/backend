const Attempt = require("../models/Attempt");

router.post("/violation", async (req, res) => {
  const { userId, reason } = req.body;

  const attempt = await Attempt.findOne({ userId }).sort({ submitTime: -1 });

  if (!attempt) return res.json({ ignored: true });

  attempt.violations += 1;
  attempt.violationTypes.push(reason);

  if (attempt.violations >= 3) {
    attempt.rankScore = -9999;
    await attempt.save();
    return res.json({ disqualified: true });
  }

  await attempt.save();
  res.json({ logged: true });
});
