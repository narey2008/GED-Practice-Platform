const mongoose = require("mongoose");

const practiceHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    skill: {
      type: String,
      default: "Mixed Practice"
    },
    difficulty: {
      type: String,
      default: "GED-Level"
    },
    correctCount: {
      type: Number,
      required: true
    },
    wrongCount: {
      type: Number,
      required: true
    },
    totalQuestions: {
      type: Number,
      required: true
    },
    accuracyPercent: {
      type: Number,
      required: true
    },
    questions: {
      type: Array,
      default: []
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("PracticeHistory", practiceHistorySchema);