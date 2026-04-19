const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const buildTest = require("./generators/testBuilder");
const User = require("./models/User");
const SavedProgress = require("./models/SavedProgress");
const TestHistory = require("./models/TestHistory");
const PracticeHistory = require("./models/PracticeHistory");
const SupportTicket = require("./models/SupportTicket");
const authMiddleware = require("./middleware/auth");

console.log("RUNNING BACKEND SERVER FILE");
console.log("DEBUG VERSION: forgot-password-route-check-2026-04-17");
console.log("DEBUG VERSION: backend/server.js forgot-password build marker");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const SUPPORT_INBOX = process.env.SUPPORT_INBOX || "gedpracticeplatform@gmail.com";

const requiredEnv = ["MONGODB_URI", "JWT_SECRET"];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const emailEnv = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "APP_BASE_URL"];
for (const key of emailEnv) {
  if (!process.env[key]) {
    console.warn(`Missing email environment variable: ${key}`);
  }
}

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://gedpracticeplatform.com",
  "https://www.gedpracticeplatform.com"
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
  })
);

app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

function createToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function sanitizeUser(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    displayName: user.displayName,
    emailVerified: !!user.emailVerified,
    createdAt: user.createdAt
  };
}

const mailTransport =
  process.env.SMTP_HOST &&
  process.env.SMTP_PORT &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      })
    : null;

function createPasswordResetToken() {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes

  return {
    rawToken,
    tokenHash,
    expiresAt
  };
}

function createEmailVerificationToken() {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

  return {
    rawToken,
    tokenHash,
    expiresAt
  };
}

async function sendEmailVerificationEmail({ email, rawToken }) {
  if (!mailTransport) {
    throw new Error("Email system is not configured.");
  }

  const verifyUrl = `${process.env.APP_BASE_URL}/?verifyToken=${encodeURIComponent(rawToken)}&verifyEmail=${encodeURIComponent(email)}`;

  await mailTransport.sendMail({
    from: `"GED Practice Platform" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Verify your GED Practice Platform email",
    text: `Welcome to GED Practice Platform.

Please verify your email by opening this link:
${verifyUrl}

This link expires in 24 hours.

If you did not create this account, you can ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#10233f;">
        <h2>Verify your email</h2>
        <p>Welcome to GED Practice Platform.</p>
        <p>Please confirm that this email address belongs to you.</p>
        <p>
          <a href="${verifyUrl}" style="display:inline-block;padding:10px 16px;background:#153e75;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700;">
            Verify Email
          </a>
        </p>
        <p>If the button does not work, use this link:</p>
        <p>${verifyUrl}</p>
        <p>This link expires in 24 hours.</p>
        <p>If you did not create this account, you can ignore this email.</p>
      </div>
    `
  });
}

async function sendPasswordResetEmail({ email, rawToken }) {
  if (!mailTransport) {
    throw new Error("Email system is not configured.");
  }

  const resetUrl = `${process.env.APP_BASE_URL}/?resetToken=${encodeURIComponent(rawToken)}&resetEmail=${encodeURIComponent(email)}`;

  await mailTransport.sendMail({
    from: `"GED Practice Platform" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Reset your GED Practice Platform password",
    text: `You requested a password reset.

Open this link to reset your password:
${resetUrl}

This link expires in 30 minutes.

If you did not request this, you can ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#10233f;">
        <h2>Reset your GED Practice Platform password</h2>
        <p>You requested a password reset.</p>
        <p>
          <a href="${resetUrl}" style="display:inline-block;padding:10px 16px;background:#153e75;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700;">
            Reset Password
          </a>
        </p>
        <p>If the button does not work, use this link:</p>
        <p>${resetUrl}</p>
        <p>This link expires in 30 minutes.</p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `
  });
}

async function sendSupportTicketEmail({ ticket }) {
  if (!mailTransport) {
    throw new Error("Email system is not configured.");
  }

  const submittedAt = new Date(ticket.createdAt || Date.now()).toISOString();

  await mailTransport.sendMail({
    from: `"GED Practice Platform" <${process.env.SMTP_USER}>`,
    to: SUPPORT_INBOX,
    subject: `[Support Ticket] ${ticket.subject}`,
    text: `
New GED Practice Platform support ticket

Ticket ID: ${ticket._id}
Type: ${ticket.type}
Tag: ${ticket.tag}
Status: ${ticket.status}
Source: ${ticket.source}
Submitted At: ${submittedAt}

Display Name: ${ticket.displayName || "—"}
Contact Email: ${ticket.contactEmail || "—"}
Account Email: ${ticket.accountEmail || "—"}
User ID: ${ticket.userId || "—"}

Page / Feature:
${ticket.pageFeature || "—"}

User Status:
${ticket.userStatus || "—"}

Device / Browser:
${ticket.deviceBrowser || "—"}

Details:
${ticket.details}
    `.trim(),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#10233f;">
        <h2>New Support Ticket</h2>
        <p><strong>Ticket ID:</strong> ${ticket._id}</p>
        <p><strong>Type:</strong> ${ticket.type}</p>
        <p><strong>Tag:</strong> ${ticket.tag}</p>
        <p><strong>Status:</strong> ${ticket.status}</p>
        <p><strong>Source:</strong> ${ticket.source}</p>
        <p><strong>Submitted At:</strong> ${submittedAt}</p>
        <hr />
        <p><strong>Display Name:</strong> ${ticket.displayName || "—"}</p>
        <p><strong>Contact Email:</strong> ${ticket.contactEmail || "—"}</p>
        <p><strong>Account Email:</strong> ${ticket.accountEmail || "—"}</p>
        <p><strong>User ID:</strong> ${ticket.userId || "—"}</p>
        <p><strong>Page / Feature:</strong><br />${ticket.pageFeature || "—"}</p>
        <p><strong>User Status:</strong><br />${ticket.userStatus || "—"}</p>
        <p><strong>Device / Browser:</strong><br />${ticket.deviceBrowser || "—"}</p>
        <p><strong>Details:</strong><br />${String(ticket.details || "").replace(/\n/g, "<br />")}</p>
      </div>
    `
  });
}

async function sendSupportConfirmationEmail({ to, ticket }) {
  if (!mailTransport || !to) {
    return;
  }

  await mailTransport.sendMail({
    from: `"GED Practice Platform" <${process.env.SMTP_USER}>`,
    to,
    subject: "We received your GED Practice Platform support request",
    text: `
We received your support request.

Ticket ID: ${ticket._id}
Subject: ${ticket.subject}
Type: ${ticket.type}

Our team will review it as soon as possible.

Thank you,
GED Practice Platform
    `.trim(),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#10233f;">
        <h2>Support Request Received</h2>
        <p>We received your support request.</p>
        <p><strong>Ticket ID:</strong> ${ticket._id}</p>
        <p><strong>Subject:</strong> ${ticket.subject}</p>
        <p><strong>Type:</strong> ${ticket.type}</p>
        <p>Our team will review it as soon as possible.</p>
        <p>Thank you,<br />GED Practice Platform</p>
      </div>
    `
  });
}

app.get("/api/health", async (req, res) => {
  const dbState = mongoose.connection.readyState;
  res.json({
    ok: true,
    databaseConnected: dbState === 1
  });
});

app.get("/api/debug-email-verification-version", (req, res) => {
  res.json({
    ok: true,
    version: "email-verification-backend-live-check",
    timestamp: new Date().toISOString()
  });
});



app.get("/api/debug-forgot-password", (req, res) => {
  res.json({
    ok: true,
    forgotPasswordRouteLoaded: true,
    timestamp: new Date().toISOString()
  });
});

app.get("/api/debug-nathan-2026-reset-check", (req, res) => {
  res.json({
    ok: true,
    route: "api/debug-nathan-2026-reset-check",
    serverFileReached: true,
    timestamp: new Date().toISOString()
  });
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const rawEmail =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    const password =
      typeof req.body.password === "string"
        ? req.body.password
        : "";

    const displayNameRaw =
      typeof req.body.displayName === "string"
        ? req.body.displayName.trim()
        : "";

    if (!rawEmail) {
      return res.status(400).json({ error: "Email is required." });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long." });
    }

    if (displayNameRaw.length > 60) {
      return res.status(400).json({ error: "Display name must be 60 characters or fewer." });
    }

    const existingUser = await User.findOne({ email: rawEmail });
    if (existingUser) {
      return res.status(409).json({ error: "An account with that email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const { rawToken, tokenHash, expiresAt } = createEmailVerificationToken();

    const user = await User.create({
      email: rawEmail,
      displayName: displayNameRaw || rawEmail.split("@")[0],
      passwordHash,
      emailVerified: false,
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpiresAt: expiresAt
    });

    await sendEmailVerificationEmail({
      email: user.email,
      rawToken
    });

    return res.status(201).json({
      success: true,
      requiresEmailVerification: true,
      message: "Account created. Please verify your email before signing in."
    });
  } catch (error) {
    console.error("REGISTER ERROR:");
    console.error(error);
    return res.status(500).json({
      error: error.message || "Failed to create account."
    });
  }
});

app.post("/api/auth/verify-email", async (req, res) => {
  try {
    const rawEmail =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    const rawToken =
      typeof req.body.token === "string"
        ? req.body.token.trim()
        : "";

    if (!rawEmail || !rawToken) {
      return res.status(400).json({ error: "Email and token are required." });
    }

    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    const user = await User.findOne({
      email: rawEmail,
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpiresAt: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ error: "This verification link is invalid or has expired." });
    }

    user.emailVerified = true;
    user.emailVerificationTokenHash = null;
    user.emailVerificationExpiresAt = null;
    await user.save();

    return res.json({
      success: true,
      message: "Email verified successfully."
    });
  } catch (error) {
    console.error("VERIFY EMAIL ERROR:");
    console.error(error);
    return res.status(500).json({
      error: error.message || "Failed to verify email."
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const rawEmail =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    const password =
      typeof req.body.password === "string"
        ? req.body.password
        : "";

    if (!rawEmail || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email: rawEmail });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        error: "Please verify your email before signing in.",
        code: "EMAIL_NOT_VERIFIED",
        requiresEmailVerification: true
      });
    }

    const token = createToken(user);

    return res.json({
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error("LOGIN ERROR:");
    console.error(error);
    return res.status(500).json({
      error: error.message || "Failed to sign in."
    });
  }
});

app.post("/api/auth/forgot-password", async (req, res) => {
  console.log("FORGOT PASSWORD HIT");
  console.log("BODY:", req.body);

  try {
    const rawEmail =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    console.log("EMAIL:", rawEmail);

    if (!rawEmail) {
      console.log("FORGOT PASSWORD: missing email");
      return res.status(400).json({ error: "Email is required." });
    }

    const user = await User.findOne({ email: rawEmail });
    console.log("USER FOUND:", !!user);

    if (user) {
      const { rawToken, tokenHash, expiresAt } = createPasswordResetToken();

      user.passwordResetTokenHash = tokenHash;
      user.passwordResetExpiresAt = expiresAt;
      await user.save();

      console.log("RESET TOKEN SAVED");

      await sendPasswordResetEmail({
        email: user.email,
        rawToken
      });

      console.log("RESET EMAIL SENT");
    }

    return res.json({
      success: true,
      message: "If an account exists for that email, a reset link has been sent."
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:");
    console.error(error);

    return res.status(500).json({
      error: error.message || "Failed to start password reset."
    });
  }
});

app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const rawEmail =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    const rawToken =
      typeof req.body.token === "string"
        ? req.body.token.trim()
        : "";

    const newPassword =
      typeof req.body.password === "string"
        ? req.body.password
        : "";

    if (!rawEmail || !rawToken || !newPassword) {
      return res.status(400).json({ error: "Email, token, and new password are required." });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long." });
    }

    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    const user = await User.findOne({
      email: rawEmail,
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ error: "This reset link is invalid or has expired." });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    await user.save();

    return res.json({
      success: true,
      message: "Password reset successful."
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:");
    console.error(error);
    return res.status(500).json({
      error: error.message || "Failed to reset password."
    });
  }
});

app.get("/api/auth/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.auth.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.json({
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error("ME ERROR:");
    console.error(error);
    return res.status(500).json({
      error: error.message || "Failed to load account."
    });
  }
});

app.post("/api/auth/resend-verification", async (req, res) => {
  try {
    const rawEmail =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    if (!rawEmail) {
      return res.status(400).json({ error: "Email is required." });
    }

    const user = await User.findOne({ email: rawEmail });

    if (user && !user.emailVerified) {
      const { rawToken, tokenHash, expiresAt } = createEmailVerificationToken();

      user.emailVerificationTokenHash = tokenHash;
      user.emailVerificationExpiresAt = expiresAt;
      await user.save();

      await sendEmailVerificationEmail({
        email: user.email,
        rawToken
      });
    }

    return res.json({
      success: true,
      message: "If an unverified account exists for that email, a new verification email has been sent."
    });
  } catch (error) {
    console.error("RESEND VERIFICATION ERROR:");
    console.error(error);
    return res.status(500).json({
      error: error.message || "Failed to resend verification email."
    });
  }
});

app.post("/api/auth/delete-account", authMiddleware, async (req, res) => {
  try {
    const password =
      typeof req.body.password === "string"
        ? req.body.password
        : "";

    if (!password) {
      return res.status(400).json({ error: "Password is required." });
    }

    const user = await User.findById(req.auth.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ error: "Incorrect password." });
    }

    await SavedProgress.findOneAndDelete({ userId: req.auth.userId });
    await TestHistory.deleteMany({ userId: req.auth.userId });
    await PracticeHistory.deleteMany({ userId: req.auth.userId });
    await User.findByIdAndDelete(req.auth.userId);

    return res.json({
      success: true,
      message: "Account and associated data deleted successfully."
    });
  } catch (error) {
    console.error("DELETE ACCOUNT ERROR:");
    console.error(error);
    return res.status(500).json({
      error: error.message || "Failed to delete account."
    });
  }
});

app.post("/api/support/ticket", async (req, res) => {
  try {
    const rawType =
      typeof req.body.type === "string"
        ? req.body.type.trim()
        : "other";

    const typeMap = {
      bug: "bug",
      addition: "addition",
      change_remove: "change_remove",
      other: "other"
    };

    const type = typeMap[rawType] || "other";

    const subject =
      typeof req.body.subject === "string"
        ? req.body.subject.trim()
        : "";

    const details =
      typeof req.body.details === "string"
        ? req.body.details.trim()
        : "";

    const pageFeature =
      typeof req.body.pageFeature === "string"
        ? req.body.pageFeature.trim()
        : "";

    const userStatus =
      typeof req.body.userStatus === "string"
        ? req.body.userStatus.trim()
        : "";

    const deviceBrowser =
      typeof req.body.deviceBrowser === "string"
        ? req.body.deviceBrowser.trim()
        : "";

    const contactEmail =
      typeof req.body.contactEmail === "string"
        ? req.body.contactEmail.trim().toLowerCase()
        : "";

    const displayName =
      typeof req.body.displayName === "string"
        ? req.body.displayName.trim()
        : "";

    if (!subject) {
      return res.status(400).json({ error: "Subject is required." });
    }

    if (!details) {
      return res.status(400).json({ error: "Details are required." });
    }

    const authHeader = req.headers.authorization || "";
    let authedUser = null;

    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7);

      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        authedUser = await User.findById(payload.userId);
      } catch (error) {
        authedUser = null;
      }
    }

    const ticket = await SupportTicket.create({
      type,
      subject,
      details,
      pageFeature,
      userStatus,
      deviceBrowser,
      contactEmail,
      displayName: displayName || authedUser?.displayName || "",
      accountEmail: authedUser?.email || "",
      userId: authedUser?._id || null,
      tag: type,
      status: "open",
      source: "support_form"
    });

    await sendSupportTicketEmail({ ticket });

    if (contactEmail) {
      await sendSupportConfirmationEmail({
        to: contactEmail,
        ticket
      });
    }

    return res.status(201).json({
      success: true,
      ticketId: ticket._id.toString(),
      message: "Support ticket submitted successfully."
    });
  } catch (error) {
    console.error("SUPPORT TICKET ERROR:");
    console.error(error);
    return res.status(500).json({
      error: error.message || "Failed to submit support ticket."
    });
  }
});

app.get("/api/progress", authMiddleware, async (req, res) => {
  try {
    const saved = await SavedProgress.findOne({ userId: req.auth.userId });

    if (!saved) {
      return res.json({ progress: null });
    }

    return res.json({
      progress: {
        mode: saved.mode,
        difficulty: saved.difficulty,
        questions: saved.questions,
        currentIndex: saved.currentIndex,
        timeRemaining: saved.timeRemaining,
        practiceMeta: saved.practiceMeta,
        overtimeUsed: saved.overtimeUsed,
        timeoutMode: saved.timeoutMode,
        lockedReviewMode: saved.lockedReviewMode,
        updatedAt: saved.updatedAt
      }
    });
  } catch (error) {
    console.error("GET PROGRESS ERROR:");
    console.error(error);
    return res.status(500).json({ error: "Failed to load saved progress." });
  }
});

app.post("/api/progress/save", authMiddleware, async (req, res) => {
  try {
    const payload = {
      userId: req.auth.userId,
      mode: req.body.mode || "test",
      difficulty: req.body.difficulty || "GED-Level",
      questions: Array.isArray(req.body.questions) ? req.body.questions : [],
      currentIndex: Number(req.body.currentIndex) || 0,
      timeRemaining: Number(req.body.timeRemaining) || 0,
      practiceMeta: req.body.practiceMeta || null,
      overtimeUsed: !!req.body.overtimeUsed,
      timeoutMode: !!req.body.timeoutMode,
      lockedReviewMode: !!req.body.lockedReviewMode
    };

    const saved = await SavedProgress.findOneAndUpdate(
      { userId: req.auth.userId },
      payload,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({
      success: true,
      updatedAt: saved.updatedAt
    });
  } catch (error) {
    console.error("SAVE PROGRESS ERROR:");
    console.error(error);
    return res.status(500).json({ error: "Failed to save progress." });
  }
});

app.delete("/api/progress", authMiddleware, async (req, res) => {
  try {
    await SavedProgress.findOneAndDelete({ userId: req.auth.userId });
    return res.json({ success: true });
  } catch (error) {
    console.error("DELETE PROGRESS ERROR:");
    console.error(error);
    return res.status(500).json({ error: "Failed to delete saved progress." });
  }
});

app.get("/api/test", (req, res) => {
  try {
    const requested = Number(req.query.count) || 46;
    const count = Math.max(1, Math.min(100, requested));
    const difficulty = req.query.difficulty || "GED-Level";
    const questions = buildTest({ count, difficulty });
    res.json({ questions });
  } catch (error) {
    console.error("Failed to build test:", error);
    res.status(500).json({ error: "Failed to build test" });
  }
});

app.get("/api/practice", (req, res) => {
  try {
    const requested = Number(req.query.count) || 12;
    const count = Math.max(1, Math.min(30, requested));
    const difficulty = req.query.difficulty || "GED-Level";
    const skill = req.query.skill || "";
    const questions = buildTest({ count, difficulty, skill });
    res.json({ questions });
  } catch (error) {
    console.error("Failed to build practice set:", error);
    res.status(500).json({ error: "Failed to build practice set" });
  }
  });
  app.post("/api/test/complete", authMiddleware, async (req, res) => {
  try {
    const {
      questions,
      difficulty
    } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: "Invalid test data." });
    }

    const totalQuestions = questions.length;

    let correctCount = 0;
    const skillStats = {};

    questions.forEach((q) => {
      const isCorrect =
        String(q.userAnswer ?? "").trim() === String(q.answer ?? "").trim();

      if (isCorrect) correctCount++;

      const skill = q.skill || "Unknown";

      if (!skillStats[skill]) {
        skillStats[skill] = { correct: 0, total: 0 };
      }

      skillStats[skill].total += 1;
      if (isCorrect) skillStats[skill].correct += 1;
    });

    const wrongOrUnansweredCount = totalQuestions - correctCount;

    // GED-style rough scaling (keep simple for now)
    const score200 = Math.round(100 + (correctCount / totalQuestions) * 100);

    // find weakest skill
    let weakestSkill = "—";
    let lowestAccuracy = 1;

    Object.entries(skillStats).forEach(([skill, stats]) => {
      const accuracy = stats.correct / stats.total;
      if (accuracy < lowestAccuracy) {
        lowestAccuracy = accuracy;
        weakestSkill = skill;
      }
    });

    const history = await TestHistory.create({
      userId: req.auth.userId,
      difficulty,
      score200,
      correctCount,
      wrongOrUnansweredCount,
      weakestSkill,
      totalQuestions,
      questions
    });

    // delete active saved test after completion
    await SavedProgress.findOneAndDelete({ userId: req.auth.userId });

    return res.json({
      success: true,
      historyId: history._id
    });
  } catch (error) {
    console.error("COMPLETE TEST ERROR:");
    console.error(error);
    return res.status(500).json({ error: "Failed to save completed test." });
  }
});
console.log("Registering /api/test/history route");

app.get("/api/test/history", authMiddleware, async (req, res) => {
  try {
    const history = await TestHistory.find({ userId: req.auth.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json({ history });
  } catch (error) {
    console.error("GET HISTORY ERROR:");
    console.error(error);
    return res.status(500).json({ error: "Failed to load test history." });
  }
});

app.post("/api/practice/complete", authMiddleware, async (req, res) => {
  try {
    const {
      questions,
      difficulty,
      skill
    } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: "Invalid practice data." });
    }

    const totalQuestions = questions.length;

    let correctCount = 0;

    questions.forEach((q) => {
      const isCorrect =
        String(q.userAnswer ?? "").trim() === String(q.answer ?? "").trim();

      if (isCorrect) correctCount++;
    });

    const wrongCount = totalQuestions - correctCount;
    const accuracyPercent = Math.round((correctCount / totalQuestions) * 100);

    const history = await PracticeHistory.create({
      userId: req.auth.userId,
      skill: skill || "Mixed Practice",
      difficulty: difficulty || "GED-Level",
      correctCount,
      wrongCount,
      totalQuestions,
      accuracyPercent,
      questions
    });

    return res.json({
      success: true,
      historyId: history._id
    });
  } catch (error) {
    console.error("COMPLETE PRACTICE ERROR:");
    console.error(error);
    return res.status(500).json({ error: "Failed to save completed practice." });
  }
});

app.get("/api/practice/history", authMiddleware, async (req, res) => {
  try {
    const history = await PracticeHistory.find({ userId: req.auth.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json({ history });
  } catch (error) {
    console.error("GET PRACTICE HISTORY ERROR:");
    console.error(error);
    return res.status(500).json({ error: "Failed to load practice history." });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();