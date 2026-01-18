const mongoose = require("mongoose");

const AttemptSchema = new mongoose.Schema({
  userId: String,
  name: String,
  loginTime: Date,
  submitTime: Date,
  score: Number,
  totalTime: Number,
  timePerQuestion: Object,
  violations: { type: Number, default: 0 },
  violationTypes: { type: [String], default: [] },
  rankScore: Number
});

module.exports = mongoose.model("Attempt", AttemptSchema);

