const mongoose = require("mongoose");

const learningHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    skill: {
      type: String,
      default: "Learning Mode"
    },
    subskill: {
      type: String,
      default: ""
    },
    difficulty: {
      type: String,
      default: "GED-Level"
    },
    examplesStudied: {
      type: Number,
      required: true
    },
    questionsAnswered: {
      type: Number,
      required: true
    },
    correctCount: {
      type: Number,
      required: true
    },
    incorrectCount: {
      type: Number,
      required: true
    },
    totalQuestions: {
      type: Number,
      required: true
    },

    detailExamples: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },
    detailPracticeQuestions: {
      type: [mongoose.Schema.Types.Mixed],
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

module.exports = mongoose.model("LearningHistory", learningHistorySchema);
