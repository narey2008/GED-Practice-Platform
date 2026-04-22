const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60
    },
    passwordHash: {
      type: String,
      required: true
    },

    emailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationTokenHash: {
      type: String,
      default: null
    },
    emailVerificationExpiresAt: {
      type: Date,
      default: null
    },

    passwordResetTokenHash: {
      type: String,
      default: null
    },
    passwordResetExpiresAt: {
      type: Date,
      default: null
    },

    accountActionTokenHash: {
      type: String,
      default: null
    },
    accountActionExpiresAt: {
      type: Date,
      default: null
    },
    accountActionType: {
      type: String,
      default: null
    },
    pendingVerifiedAction: {
      type: String,
      default: null
    },
    pendingVerifiedActionExpiresAt: {
      type: Date,
      default: null
    },

    pendingNewEmail: {
      type: String,
      default: null,
      lowercase: true,
      trim: true
    },
    pendingNewEmailTokenHash: {
      type: String,
      default: null
    },
    pendingNewEmailExpiresAt: {
      type: Date,
      default: null
    },

    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    loginTwoFactorTokenHash: {
      type: String,
      default: null
    },
    loginTwoFactorExpiresAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);