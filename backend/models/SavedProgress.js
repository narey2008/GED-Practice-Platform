const mongoose = require("mongoose");

const savedProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    mode: {
      type: String,
      required: true
    },
    difficulty: {
      type: String,
      default: "GED-Level"
    },
    questions: {
      type: Array,
      default: []
    },
    currentIndex: {
      type: Number,
      default: 0
    },
    timeRemaining: {
      type: Number,
      default: 0
    },
    practiceMeta: {
      type: Object,
      default: null
    },
    overtimeUsed: {
      type: Boolean,
      default: false
    },
    timeoutMode: {
      type: Boolean,
      default: false
    },
    lockedReviewMode: {
      type: Boolean,
      default: false
    },
    shownTenMinuteWarning: {
      type: Boolean,
      default: false
    },
    shownOneMinuteWarning: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("SavedProgress", savedProgressSchema);
