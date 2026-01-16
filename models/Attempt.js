const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [{ question: String, selected: String, correct: Boolean }],
  score: { type: Number, default: 0 },
  timeTaken: { type: Number, default: 0 },
  completedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Attempt', attemptSchema);
