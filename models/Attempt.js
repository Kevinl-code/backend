const mongoose = require("mongoose");

const AttemptSchema = new mongoose.Schema({
  userId: String,
  name: String,
  loginTime: Date,
  submitTime: Date,
  score: Number,
  totalTime: Number,
  timePerQuestion: Object,
  violations: Number,
  violationTypes: [String],
  rankScore: Number
});

module.exports = mongoose.model("Attempt", AttemptSchema);
