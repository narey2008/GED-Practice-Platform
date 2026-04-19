const mongoose = require("mongoose");

const supportTicketSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["bug", "addition", "change_remove", "other"],
      default: "other"
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    details: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000
    },
    pageFeature: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200
    },
    userStatus: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100
    },
    deviceBrowser: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300
    },
    contactEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
      maxlength: 320
    },
    displayName: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100
    },
    accountEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
      maxlength: 320
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    tag: {
      type: String,
      enum: ["bug", "addition", "change_remove", "other"],
      default: "other"
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open"
    },
    source: {
      type: String,
      enum: ["support_form", "question_report"],
      default: "support_form"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("SupportTicket", supportTicketSchema);