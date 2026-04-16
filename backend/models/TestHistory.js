const mongoose = require("mongoose");

const testHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    difficulty: {
      type: String,
      default: "GED-Level"
    },
    score200: {
      type: Number,
      required: true
    },
    correctCount: {
      type: Number,
      required: true
    },
    wrongOrUnansweredCount: {
      type: Number,
      required: true
    },
    weakestSkill: {
      type: String,
      default: "—"
    },
    totalQuestions: {
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

module.exports = mongoose.model("TestHistory", testHistorySchema);