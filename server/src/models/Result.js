const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  testId: String,
  score: Number,
  percentage: Number,
  totalQuestions: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Result", resultSchema);
