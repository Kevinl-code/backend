const mongoose = require("mongoose");

const ViolationSchema = new mongoose.Schema({
  userId: String,
  type: String,
  timestamp: { type: Date, default: Date.now },
  autoDisqualified: Boolean
});

module.exports = mongoose.model("Violation", ViolationSchema);
