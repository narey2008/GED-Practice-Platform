const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Resend } = require("resend");

const buildTest = require("./generators/testBuilder");
const User = require("./models/User");
const SavedProgress = require("./models/SavedProgress");
const TestHistory = require("./models/TestHistory");
const PracticeHistory = require("./models/PracticeHistory");
const LearningHistory = require("./models/LearningHistory");
const SupportTicket = require("./models/SupportTicket");
const authMiddleware = require("./middleware/auth");
const upload = require("./middleware/upload");

console.log("RUNNING BACKEND SERVER FILE");
console.log("DEBUG VERSION: resend-migration-2026-05-15");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const REQUEST_BODY_LIMIT = "1mb";
const SUPPORT_INBOX = process.env.SUPPORT_EMAIL || process.env.SUPPORT_INBOX || "gedpracticeplatform@gmail.com";
const EMAIL_FROM = process.env.EMAIL_FROM || "onboarding@resend.dev";

const requiredEnv = ["MONGODB_URI", "JWT_SECRET"];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const emailEnv = ["RESEND_API_KEY", "EMAIL_FROM", "SUPPORT_EMAIL", "APP_BASE_URL"];
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

app.use(express.json({ limit: REQUEST_BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: REQUEST_BODY_LIMIT }));
app.use(express.static(path.join(__dirname, "../frontend")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
    scoringEnabled: user.scoringEnabled !== false,
    scoringPreferenceChosen: user.scoringPreferenceChosen === true,
    emailVerified: !!user.emailVerified,
    twoFactorEnabled: !!user.twoFactorEnabled || !!user.emailVerified,
    hasPendingVerifiedAction:
      !!user.pendingVerifiedAction &&
      !!user.pendingVerifiedActionExpiresAt &&
      user.pendingVerifiedActionExpiresAt > new Date(),
    createdAt: user.createdAt
  };
}

function normalizeComparableAnswer(value) {
  const raw = String(value ?? "").trim().toLowerCase();
  if (!raw) return "";

  const cleaned = raw.replace(/\s+/g, "");

  if (/^-?\d+\/-?\d+$/.test(cleaned)) {
    const [numStr, denStr] = cleaned.split("/");
    const num = Number(numStr);
    const den = Number(denStr);

    if (Number.isFinite(num) && Number.isFinite(den) && den !== 0) {
      return String(num / den);
    }
  }

  if (/^-?\d+(\.\d+)?$/.test(cleaned)) {
    const num = Number(cleaned);
    if (Number.isFinite(num)) {
      return String(num);
    }
  }

  return cleaned;
}

function answersMatch(userAnswer, correctAnswer) {
  const normalizeDragDropValue = (value) => {
    if (Array.isArray(value)) {
      return value.map((x) => String(x).trim()).join(" | ");
    }
    return value;
  };

  const a = normalizeComparableAnswer(normalizeDragDropValue(userAnswer));
  const b = normalizeComparableAnswer(normalizeDragDropValue(correctAnswer));

  if (!a && !b) return true;
  if (!a || !b) return false;

  const numA = Number(a);
  const numB = Number(b);

  if (Number.isFinite(numA) && Number.isFinite(numB)) {
    return Math.abs(numA - numB) < 0.000001;
  }

  return a === b;
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

console.log("EMAIL CONFIG BOOT CHECK:", {
  resendConfigured: !!process.env.RESEND_API_KEY,
  emailFromConfigured: !!process.env.EMAIL_FROM,
  supportEmailConfigured: !!process.env.SUPPORT_EMAIL,
  appBaseUrlConfigured: !!process.env.APP_BASE_URL,
  emailClientConfigured: !!resend
});

if (!resend) {
  console.warn("EMAIL VERIFY SKIPPED: Resend API is not configured");
}

async function sendEmail({ to, subject, html, text }) {
  if (!resend) {
    throw new Error("Email system is not configured.");
  }

  try {
    const payload = {
      from: EMAIL_FROM,
      to,
      subject,
      html
    };

    if (text) payload.text = text;

    const result = await resend.emails.send(payload);

    if (result.error) {
      console.error("RESEND SEND ERROR:", {
        to,
        subject,
        errorName: result.error.name || null,
        errorMessage: result.error.message || "Unknown Resend error"
      });
      throw new Error(result.error.message || "Email send failed.");
    }

    console.log("RESEND SEND SUCCESS:", {
      to,
      subject,
      emailId: result.data?.id || null
    });

    return result.data;
  } catch (error) {
    console.error("RESEND SEND EXCEPTION:", {
      to,
      subject,
      message: error.message
    });
    throw error;
  }
}

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

function buildEmailTemplate({ title, body, buttonText, buttonUrl }) {
  return `
    <div style="font-family:Arial,sans-serif;background:#f5f7fb;padding:30px;">
      <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;padding:24px;border:1px solid #e3e7ee;">
        
        <div style="font-size:20px;font-weight:800;color:#153e75;margin-bottom:12px;">
          GED Practice Platform
        </div>

        <div style="font-size:18px;font-weight:700;color:#10233f;margin-bottom:12px;">
          ${title}
        </div>

        <div style="font-size:14px;line-height:1.6;color:#10233f;margin-bottom:20px;">
          ${body}
        </div>

        ${
          buttonUrl
            ? `<div style="text-align:center;margin-bottom:20px;">
                <a href="${buttonUrl}" style="display:inline-block;padding:12px 18px;background:#153e75;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700;">
                  ${buttonText}
                </a>
              </div>`
            : ""
        }

        <div style="font-size:12px;color:#6b7280;border-top:1px solid #e3e7ee;padding-top:12px;margin-top:12px;">
          <div>GED Practice Platform</div>
          <div style="margin-top:6px;">
            <a href="#" style="color:#153e75;text-decoration:none;">Terms</a> •
            <a href="#" style="color:#153e75;text-decoration:none;">Privacy</a> •
            <a href="#" style="color:#153e75;text-decoration:none;">FAQ</a> •
            <a href="#" style="color:#153e75;text-decoration:none;">About</a>
          </div>
        </div>

      </div>
    </div>
  `;
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
function createAccountActionToken() {
  const rawToken = String(Math.floor(100000 + Math.random() * 900000));
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes

  return {
    rawToken,
    tokenHash,
    expiresAt
  };
}

function createLoginTwoFactorToken() {
  const rawToken = String(Math.floor(100000 + Math.random() * 900000));
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes

  return {
    rawToken,
    tokenHash,
    expiresAt
  };
}

async function sendLoginTwoFactorEmail({ email, rawToken }) {
  

  const html = buildEmailTemplate({
    title: "Your Login Security Code",
    body: `
      Use the code below to complete your sign-in:<br><br>
      <div style="font-size:24px;font-weight:800;letter-spacing:4px;text-align:center;margin:16px 0;">
        ${rawToken}
      </div>
      This code expires in 10 minutes.
    `
  });

const info = await sendEmail({
    to: email,
  subject: "Your GED Practice Platform login security code",
  html
});

console.log("LOGIN SECURITY CODE EMAIL SEND RESULT:", {
  to: email,
  emailId: info?.id || null
});
}

async function sendAccountActionVerificationEmail({ email, rawToken, actionType }) {
  

  const actionLabelMap = {
    changePassword: "change your password",
    changeUsername: "change your username",
    changeEmail: "change your email"
  };

  const actionLabel = actionLabelMap[actionType] || "complete a sensitive account action";

  await sendEmail({
        to: email,
    subject: "Your GED Practice Platform security code",
    text: `You requested to ${actionLabel}.

Your security code is: ${rawToken}

This code expires in 15 minutes.

If you did not request this, you can ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#10233f;">
        <h2>Security Confirmation Required</h2>
        <p>You requested to ${actionLabel}.</p>
        <p>Enter this security code to continue:</p>
        <div style="display:inline-block;padding:12px 18px;background:#153e75;color:#ffffff;border-radius:10px;font-size:24px;font-weight:800;letter-spacing:0.12em;">
          ${rawToken}
        </div>
        <p style="margin-top:16px;">This code expires in 15 minutes.</p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `
  });
}
async function sendEmailVerificationEmail({ email, rawToken }) {
  

  const verifyUrl = `${process.env.APP_BASE_URL}/?verifyToken=${encodeURIComponent(rawToken)}&verifyEmail=${encodeURIComponent(email)}`;

  const html = buildEmailTemplate({
    title: "Verify Your Email",
    body: `Welcome to GED Practice Platform.<br><br>Please verify your email to activate your account.`,
    buttonText: "Verify Email",
    buttonUrl: verifyUrl
  });

  await sendEmail({
        to: email,
    subject: "Verify your GED Practice Platform account",
    html
  });
}

async function sendPendingEmailChangeVerificationEmail({ email, rawToken }) {
  

  const verifyUrl = `${process.env.APP_BASE_URL}/?confirmEmailChangeToken=${encodeURIComponent(rawToken)}&confirmEmailChangeEmail=${encodeURIComponent(email)}`;

  const html = buildEmailTemplate({
    title: "Confirm Your New Email",
    body: `You requested to change your account email.<br><br>Please confirm this new email address.`,
    buttonText: "Confirm Email",
    buttonUrl: verifyUrl
  });

  await sendEmail({
        to: email,
    subject: "Confirm your new GED Practice Platform email",
    html
  });
}

async function sendPasswordResetEmail({ email, rawToken }) {
  

  const resetUrl = `${process.env.APP_BASE_URL}/?resetToken=${encodeURIComponent(rawToken)}&resetEmail=${encodeURIComponent(email)}`;

  const html = buildEmailTemplate({
    title: "Reset Your Password",
    body: `We received a request to reset your password.<br><br>If this was you, click below.`,
    buttonText: "Reset Password",
    buttonUrl: resetUrl
  });

  await sendEmail({
        to: email,
    subject: "Reset your password",
    html
  });
}

async function sendSupportTicketEmail({ ticket }) {
  

  const submittedAt = new Date(ticket.createdAt || Date.now()).toISOString();

  await sendEmail({
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
Screenshot URL: ${ticket.screenshotUrl || "—"}
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
        <p><strong>Screenshot URL:</strong> ${ticket.screenshotUrl ? `<a href="${ticket.screenshotUrl}">${ticket.screenshotUrl}</a>` : "—"}</p>
        <p><strong>User ID:</strong> ${ticket.userId || "—"}</p>
        <p><strong>Page / Feature:</strong><br />${ticket.pageFeature || "—"}</p>
        <p><strong>User Status:</strong><br />${ticket.userStatus || "—"}</p>
        <p><strong>Device / Browser:</strong><br />${ticket.deviceBrowser || "—"}</p>
        <p><strong>Details:</strong><br />${String(ticket.details || "").replace(/\n/g, "<br />")}</p>
      </div>
    `
  });
}

async function withTimeout(promise, timeoutMs, timeoutMessage) {
  let timer = null;

  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const timeoutError = new Error(timeoutMessage || "Operation timed out.");
      timeoutError.code = "ETIMEDOUT";
      reject(timeoutError);
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function sendSupportConfirmationEmail({ to, ticket }) {
  if (!to) {
    return;
  }

  await sendEmail({
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
    version: "auth-email-deploy-check-2026-05-11",
    timestamp: new Date().toISOString()
  });
});

app.post("/api/debug/send-test-email", async (req, res) => {
  try {
    const debugSecret = process.env.DEBUG_EMAIL_SECRET || "";
    const providedSecret = req.headers["x-debug-secret"] || "";

    if (!debugSecret || providedSecret !== debugSecret) {
      return res.status(403).json({ error: "Forbidden." });
    }

    const to =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    if (!to) {
      return res.status(400).json({ error: "Email is required." });
    }

    if (!resend) {
      return res.status(500).json({
        error: "Email transport is not configured."
      });
    }

    console.log("DEBUG TEST EMAIL ATTEMPT:", { to });

    const info = await sendEmail({
            to,
      subject: "GED Practice Platform email test",
      text: "This is a test email from the GED Practice Platform backend.",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;">
          <h2>GED Practice Platform Email Test</h2>
          <p>This is a test email from the backend.</p>
          <p>If you received this, email delivery is working.</p>
        </div>
      `
    });

    console.log("DEBUG TEST EMAIL SEND RESULT:", {
      to,
      emailId: info?.id || null
    });

    return res.json({
      success: true,
      emailId: info?.id || null
    });
  } catch (error) {
    console.error("DEBUG TEST EMAIL ERROR:");
    console.error(error);

    return res.status(500).json({
      error: error.message || "Failed to send debug email.",
      code: error.code || null,
      command: error.command || null
    });
  }
});

app.get("/api/debug/email-config", (req, res) => {
  res.json({
    ok: true,
    version: "email-diagnostics-resend-v1-2026-05-15",
    resendConfigured: !!process.env.RESEND_API_KEY,
    emailFromConfigured: !!process.env.EMAIL_FROM,
    supportEmailConfigured: !!process.env.SUPPORT_EMAIL,
    supportInbox: SUPPORT_INBOX || null,
    appBaseUrl: process.env.APP_BASE_URL || null,
    emailClientConfigured: !!resend
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

app.get("/api/debug-support-ticket-version", (req, res) => {
  res.json({
    ok: true,
    supportTicketRouteExpected: true,
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

        const scoringEnabled =
  typeof req.body.scoringEnabled === "boolean"
    ? req.body.scoringEnabled
    : true;

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
  scoringEnabled,
  emailVerified: false,
  emailVerificationTokenHash: tokenHash,
  emailVerificationExpiresAt: expiresAt,
  previousEmailVerificationTokenHash: null,
  previousEmailVerificationExpiresAt: null,
  lastVerificationEmailSentAt: new Date()
});

    console.log("VERIFICATION EMAIL SEND ATTEMPT (register):", {
      email: user.email
    });

    await sendEmailVerificationEmail({
      email: user.email,
      rawToken
    });

    await sendWelcomeEmail(user.email);

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

app.patch("/api/account/scoring-preference", authMiddleware, async (req, res) => {
  try {
    const scoringEnabled =
      typeof req.body.scoringEnabled === "boolean"
        ? req.body.scoringEnabled
        : null;

    if (scoringEnabled === null) {
      return res.status(400).json({ error: "scoringEnabled must be true or false." });
    }

    const user = await User.findById(req.auth.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    user.scoringEnabled = scoringEnabled;
    user.scoringPreferenceChosen = true;
    await user.save();

    return res.json({
      success: true,
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error("UPDATE SCORING PREFERENCE ERROR:");
    console.error(error);
    return res.status(500).json({
      error: error.message || "Failed to update scoring preference."
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

    const now = new Date();

    const user = await User.findOne({
      email: rawEmail,
      $or: [
        {
          emailVerificationTokenHash: tokenHash,
          emailVerificationExpiresAt: { $gt: now }
        },
        {
          previousEmailVerificationTokenHash: tokenHash,
          previousEmailVerificationExpiresAt: { $gt: now }
        }
      ]
    });

    if (!user) {
      return res.status(400).json({ error: "This verification link is invalid or has expired." });
    }

    user.emailVerified = true;
    user.twoFactorEnabled = true;
    user.emailVerificationTokenHash = null;
    user.emailVerificationExpiresAt = null;
    user.previousEmailVerificationTokenHash = null;
    user.previousEmailVerificationExpiresAt = null;
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

async function sendWelcomeEmail(email) {
  if (!resend) return;

  const html = buildEmailTemplate({
    title: "Welcome to GED Practice Platform",
    body: `Your account has been successfully created.<br><br>You can now start practicing and tracking your progress.`,
    buttonText: "Start Practicing",
    buttonUrl: process.env.APP_BASE_URL
  });

  await sendEmail({
        to: email,
    subject: "Welcome to GED Practice Platform",
    html
  });
}

app.post("/api/auth/confirm-email-change", async (req, res) => {
  try {
    const pendingEmail =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    const rawToken =
      typeof req.body.token === "string"
        ? req.body.token.trim()
        : "";

    if (!pendingEmail || !rawToken) {
      return res.status(400).json({ error: "Email and token are required." });
    }

    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    const user = await User.findOne({
      pendingNewEmail: pendingEmail,
      pendingNewEmailTokenHash: tokenHash,
      pendingNewEmailExpiresAt: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ error: "This email change link is invalid or has expired." });
    }

    const existingUser = await User.findOne({
      email: pendingEmail,
      _id: { $ne: user._id }
    });

    if (existingUser) {
      return res.status(409).json({ error: "An account with that email already exists." });
    }

    user.email = pendingEmail;
    user.emailVerified = true;
    user.pendingNewEmail = null;
    user.pendingNewEmailTokenHash = null;
    user.pendingNewEmailExpiresAt = null;

    await user.save();

    return res.json({
      success: true,
      message: "Email changed successfully."
    });
  } catch (error) {
    console.error("CONFIRM EMAIL CHANGE ERROR:");
    console.error(error);
    return res.status(500).json({
      error: error.message || "Failed to confirm email change."
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
      console.log("LOGIN BLOCKED: email not verified", {
        email: user.email
      });

      return res.status(403).json({
        error: "Please verify your email before signing in.",
        code: "EMAIL_NOT_VERIFIED",
        requiresEmailVerification: true
      });
    }

    if (user.emailVerified === true && (user.twoFactorEnabled === true || user.twoFactorEnabled === false)) {
      console.log("LOGIN SECURITY CODE SEND ATTEMPT:", {
        email: user.email
      });

      const { rawToken, tokenHash, expiresAt } = createLoginTwoFactorToken();

      user.loginTwoFactorTokenHash = tokenHash;
      user.loginTwoFactorExpiresAt = expiresAt;
      await user.save();

      await sendLoginTwoFactorEmail({
        email: user.email,
        rawToken
      });

      return res.json({
        requiresTwoFactor: true,
        email: user.email,
        message: "A login security code was sent to your email."
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

app.post("/api/auth/verify-login-2fa", async (req, res) => {
  try {
    const rawEmail =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    const code =
      typeof req.body.code === "string"
        ? req.body.code.trim()
        : "";

    if (!rawEmail || !code) {
      return res.status(400).json({ error: "Email and code are required." });
    }

    const user = await User.findOne({ email: rawEmail });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or code." });
    }

    const codeHash = crypto.createHash("sha256").update(code).digest("hex");

    const isValid =
      user.loginTwoFactorTokenHash === codeHash &&
      user.loginTwoFactorExpiresAt &&
      user.loginTwoFactorExpiresAt > new Date();

    if (!isValid) {
      return res.status(401).json({ error: "This login code is invalid or has expired." });
    }

    user.loginTwoFactorTokenHash = null;
    user.loginTwoFactorExpiresAt = null;
    await user.save();

    const token = createToken(user);

    return res.json({
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error("VERIFY LOGIN 2FA ERROR:");
    console.error(error);
    return res.status(500).json({
      error: error.message || "Failed to verify login code."
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
app.post("/api/auth/request-account-action-verification", authMiddleware, async (req, res) => {
  try {
    const actionType =
      typeof req.body.actionType === "string"
        ? req.body.actionType.trim()
        : "";

    const allowedActionTypes = ["changePassword", "changeUsername", "changeEmail"];

    if (!allowedActionTypes.includes(actionType)) {
      return res.status(400).json({ error: "Invalid account action type." });
    }

    const user = await User.findById(req.auth.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (!user.email) {
      return res.status(400).json({ error: "No email is available for this account." });
    }

    const { rawToken, tokenHash, expiresAt } = createAccountActionToken();

    user.accountActionTokenHash = tokenHash;
    user.accountActionExpiresAt = expiresAt;
    user.accountActionType = actionType;
    user.pendingVerifiedAction = null;
    user.pendingVerifiedActionExpiresAt = null;
    await user.save();

    await sendAccountActionVerificationEmail({
      email: user.email,
      rawToken,
      actionType
    });

    return res.json({
      success: true,
      message: "Verification code sent successfully."
    });
  } catch (error) {
    console.error("REQUEST ACCOUNT ACTION VERIFICATION ERROR:");
    console.error(error);
    return res.status(500).json({
      error: error.message || "Failed to send verification code."
    });
  }
});

app.post("/api/auth/verify-account-action", authMiddleware, async (req, res) => {
  try {
    const actionType =
      typeof req.body.actionType === "string"
        ? req.body.actionType.trim()
        : "";

    const code =
      typeof req.body.code === "string"
        ? req.body.code.trim()
        : "";

    if (!actionType || !code) {
      return res.status(400).json({ error: "Action type and code are required." });
    }

    const user = await User.findById(req.auth.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const codeHash = crypto.createHash("sha256").update(code).digest("hex");

    const isValid =
      user.accountActionType === actionType &&
      user.accountActionTokenHash === codeHash &&
      user.accountActionExpiresAt &&
      user.accountActionExpiresAt > new Date();

    if (!isValid) {
      return res.status(400).json({ error: "This verification code is invalid or has expired." });
    }

    user.accountActionTokenHash = null;
    user.accountActionExpiresAt = null;
    user.accountActionType = null;
    user.pendingVerifiedAction = actionType;
    user.pendingVerifiedActionExpiresAt = new Date(Date.now() + 1000 * 60 * 15);
    await user.save();

    return res.json({
      success: true,
      message: "Verification confirmed."
    });
  } catch (error) {
    console.error("VERIFY ACCOUNT ACTION ERROR:");
    console.error(error);
    return res.status(500).json({
      error: error.message || "Failed to verify account action."
    });
  }
});

app.post("/api/auth/change-username", authMiddleware, async (req, res) => {
  try {
    const newDisplayName =
      typeof req.body.displayName === "string"
        ? req.body.displayName.trim()
        : "";

    if (!newDisplayName) {
      return res.status(400).json({ error: "Display name is required." });
    }

    if (newDisplayName.length > 60) {
      return res.status(400).json({ error: "Display name must be 60 characters or fewer." });
    }

    const user = await User.findById(req.auth.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    user.displayName = newDisplayName;
    await user.save();

    return res.json({
      success: true,
      message: "Username changed successfully.",
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error("CHANGE USERNAME ERROR:");
    console.error(error);
    return res.status(500).json({
      error: error.message || "Failed to change username."
    });
  }
});
app.post("/api/auth/change-password", authMiddleware, async (req, res) => {
  try {
    const currentPassword =
      typeof req.body.currentPassword === "string"
        ? req.body.currentPassword
        : "";

    const newPassword =
      typeof req.body.newPassword === "string"
        ? req.body.newPassword
        : "";

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "Current password and new password are required."
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: "New password must be at least 8 characters long."
      });
    }

    const user = await User.findById(req.auth.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const verifiedForThisAction =
      user.pendingVerifiedAction === "changePassword" &&
      user.pendingVerifiedActionExpiresAt &&
      user.pendingVerifiedActionExpiresAt > new Date();

    if (!verifiedForThisAction) {
      return res.status(403).json({
        error: "You must verify this action before changing your password."
      });
    }

    const passwordMatches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    user.pendingVerifiedAction = null;
    user.pendingVerifiedActionExpiresAt = null;
    await user.save();

    return res.json({
      success: true,
      message: "Password changed successfully."
    });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:");
    console.error(error);
    return res.status(500).json({
      error: error.message || "Failed to change password."
    });
  }
});

app.post("/api/auth/change-email", authMiddleware, async (req, res) => {
  try {
    const newEmail =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    const currentPassword =
      typeof req.body.currentPassword === "string"
        ? req.body.currentPassword
        : "";

    if (!newEmail || !currentPassword) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    const user = await User.findById(req.auth.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const verifiedForThisAction =
      user.pendingVerifiedAction === "changeEmail" &&
      user.pendingVerifiedActionExpiresAt &&
      user.pendingVerifiedActionExpiresAt > new Date();

    if (!verifiedForThisAction) {
      return res.status(403).json({
        error: "You must verify this action before changing your email."
      });
    }

    const passwordMatches = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!passwordMatches) {
      return res.status(400).json({ error: "Current password is incorrect." });
    }

    if (newEmail === user.email) {
      return res.status(400).json({ error: "Your new email must be different from your current email." });
    }

    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      return res.status(409).json({ error: "An account with that email already exists." });
    }

    const { rawToken, tokenHash, expiresAt } = createEmailVerificationToken();

    user.pendingNewEmail = newEmail;
    user.pendingNewEmailTokenHash = tokenHash;
    user.pendingNewEmailExpiresAt = expiresAt;
    user.pendingVerifiedAction = null;
    user.pendingVerifiedActionExpiresAt = null;

    await user.save();

    await sendPendingEmailChangeVerificationEmail({
      email: newEmail,
      rawToken
    });

    return res.json({
      success: true,
      requiresNewEmailConfirmation: true,
      message: "Please confirm your new email using the verification link that was sent."
    });
  } catch (error) {
    console.error("CHANGE EMAIL ERROR:");
    console.error(error);

    return res.status(500).json({
      error: error.message || "Failed to start email change."
    });
  }
});

app.post("/api/auth/enable-2fa", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.auth.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (user.twoFactorEnabled) {
      return res.status(400).json({ error: "Two-factor authentication is already enabled." });
    }

    user.twoFactorEnabled = true;
    await user.save();

    return res.json({
      success: true,
      message: "Two-factor authentication enabled successfully.",
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error("ENABLE 2FA ERROR:");
    console.error(error);
    return res.status(500).json({
      error: error.message || "Failed to enable two-factor authentication."
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
      const now = Date.now();
      const cooldownMs = 90 * 1000;
      const lastSentMs = user.lastVerificationEmailSentAt
        ? new Date(user.lastVerificationEmailSentAt).getTime()
        : 0;
      const elapsedMs = now - lastSentMs;

      if (lastSentMs && elapsedMs < cooldownMs) {
        const retryAfterSeconds = Math.max(1, Math.ceil((cooldownMs - elapsedMs) / 1000));
        console.log("VERIFICATION RESEND BLOCKED: cooldown active", {
          email: user.email,
          retryAfterSeconds
        });
        return res.status(429).json({
          error: "Please wait before requesting another verification email.",
          retryAfterSeconds
        });
      }

      console.log("VERIFICATION EMAIL SEND ATTEMPT (resend):", {
        email: user.email
      });

      const { rawToken, tokenHash, expiresAt } = createEmailVerificationToken();

      user.previousEmailVerificationTokenHash = user.emailVerificationTokenHash || null;
      user.previousEmailVerificationExpiresAt = user.emailVerificationExpiresAt || null;
      user.emailVerificationTokenHash = tokenHash;
      user.emailVerificationExpiresAt = expiresAt;
      user.lastVerificationEmailSentAt = new Date();
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

app.post("/api/auth/resend-login-2fa", async (req, res) => {
  try {
    const rawEmail =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    if (!rawEmail) {
      return res.status(400).json({ error: "Email is required." });
    }

    const user = await User.findOne({ email: rawEmail });

    if (!user || user.emailVerified !== true) {
      return res.status(400).json({ error: "Unable to resend login security code." });
    }

    const cooldownMs = 90 * 1000;
    const now = Date.now();
    const lastSentMs = user.lastLoginTwoFactorSentAt
      ? new Date(user.lastLoginTwoFactorSentAt).getTime()
      : 0;
    const elapsedMs = now - lastSentMs;

    if (lastSentMs && elapsedMs < cooldownMs) {
      const retryAfterSeconds = Math.max(1, Math.ceil((cooldownMs - elapsedMs) / 1000));
      console.log("LOGIN SECURITY CODE RESEND BLOCKED: cooldown active", {
        email: user.email,
        retryAfterSeconds
      });
      return res.status(429).json({
        error: "Please wait before requesting another login security code.",
        retryAfterSeconds
      });
    }

    console.log("LOGIN SECURITY CODE RESEND ATTEMPT", {
      email: user.email
    });

    const { rawToken, tokenHash, expiresAt } = createLoginTwoFactorToken();

    user.previousLoginTwoFactorTokenHash = user.loginTwoFactorTokenHash || null;
    user.previousLoginTwoFactorExpiresAt = user.loginTwoFactorExpiresAt || null;
    user.loginTwoFactorTokenHash = tokenHash;
    user.loginTwoFactorExpiresAt = expiresAt;
    user.lastLoginTwoFactorSentAt = new Date();
    await user.save();

    await sendLoginTwoFactorEmail({
      email: user.email,
      rawToken
    });

    return res.json({
      success: true,
      message: "A new login security code was sent."
    });
  } catch (error) {
    console.error("RESEND LOGIN 2FA ERROR:");
    console.error(error);
    return res.status(500).json({
      error: error.message || "Failed to resend login security code."
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

app.post("/api/support/ticket", upload.single("screenshot"), async (req, res) => {
  try {
    const body = req.body || {};

    const rawType =
      typeof body.type === "string"
        ? body.type.trim()
        : "other";

    const typeMap = {
      bug: "bug",
      addition: "addition",
      change_remove: "change_remove",
      other: "other"
    };

    const type = typeMap[rawType] || "other";

    const subject =
      typeof body.subject === "string"
        ? body.subject.trim()
        : "";

    const details =
      typeof body.details === "string"
        ? body.details.trim()
        : "";

    const pageFeature =
      typeof body.pageFeature === "string"
        ? body.pageFeature.trim()
        : "";

    const userStatus =
      typeof body.userStatus === "string"
        ? body.userStatus.trim()
        : "";

    const deviceBrowser =
      typeof body.deviceBrowser === "string"
        ? body.deviceBrowser.trim()
        : "";

    const contactEmail =
      typeof body.contactEmail === "string"
        ? body.contactEmail.trim().toLowerCase()
        : "";

    const displayName =
      typeof body.displayName === "string"
        ? body.displayName.trim()
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

    const screenshotUrl = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : "";

    const ticket = await SupportTicket.create({
      type,
      subject,
      details,
      pageFeature,
      userStatus,
      deviceBrowser,
      contactEmail,
      screenshotUrl,
      displayName: displayName || authedUser?.displayName || "",
      accountEmail: authedUser?.email || "",
      userId: authedUser?._id || null,
      tag: type,
      status: "open",
      source: "support_form"
    });

    try {
      await withTimeout(
        sendSupportTicketEmail({ ticket }),
        20000,
        "Support inbox delivery timed out."
      );
    } catch (error) {
      console.error("SUPPORT TICKET DELIVERY ERROR:", {
        recipient: SUPPORT_INBOX,
        code: error?.code || error?.name || null,
        message: error?.message || "Unknown support delivery error"
      });

      return res.status(502).json({
        error: "Support ticket was saved, but delivery to support inbox failed. Please try again shortly."
      });
    }

    if (contactEmail) {
      await sendSupportConfirmationEmail({
        to: contactEmail,
        ticket
      });
    }

    return res.status(201).json({
      success: true,
      ticketId: ticket._id.toString(),
      message: "Support ticket submitted successfully.",
      screenshotUrl
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
const rawSkill = req.query.skill || "";

const practiceSkillAliases = {
  "Area, Perimeter, Surface Area, and Volume": "Geometry"
};

const skill = practiceSkillAliases[rawSkill] || rawSkill;

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
  const isCorrect = answersMatch(q.userAnswer, q.answer);

  if (isCorrect) correctCount++;

  const skill = q.skill || "Unknown";

  if (!skillStats[skill]) {
    skillStats[skill] = { correct: 0, total: 0 };
  }

  skillStats[skill].total += 1;
  if (isCorrect) skillStats[skill].correct += 1;
});

    const wrongOrUnansweredCount = totalQuestions - correctCount;

    const user = await User.findById(req.auth.userId);
if (!user) {
  return res.status(404).json({ error: "User not found." });
}

    // GED-style rough scaling (keep simple for now)
    const score200 = Math.round(100 + (correctCount / totalQuestions) * 100);

    // find weakest skill
    let weakestSkill = "—";
    let lowestAccuracy = 1;

    Object.entries(skillStats).forEach(([skill, stats]) => {
      const accuracy = stats.total ? stats.correct / stats.total : 1;
      if (accuracy < lowestAccuracy) {
        lowestAccuracy = accuracy;
        weakestSkill = skill;
      }
    });

   const history = await TestHistory.create({
  userId: req.auth.userId,
  difficulty,
  score200: user.scoringEnabled === false ? null : score200,
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
  const isCorrect = answersMatch(q.userAnswer, q.answer);

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

app.post("/api/learning/complete", authMiddleware, async (req, res) => {
  try {
    const {
      skill,
      subskill,
      difficulty,
      examplesStudied,
      questionsAnswered,
      correctCount,
      incorrectCount,
      totalQuestions,
      completedAt,
      detailExamples,
      detailPracticeQuestions
    } = req.body || {};

    const safeTotalQuestions = Number(totalQuestions);
    const safeCorrectCount = Number(correctCount);
    const safeIncorrectCount = Number(incorrectCount);
    const safeExamplesStudied = Number(examplesStudied);
    const safeQuestionsAnswered = Number(questionsAnswered);

    if (
      !Number.isFinite(safeTotalQuestions) ||
      safeTotalQuestions < 0 ||
      !Number.isFinite(safeCorrectCount) ||
      safeCorrectCount < 0 ||
      !Number.isFinite(safeIncorrectCount) ||
      safeIncorrectCount < 0 ||
      !Number.isFinite(safeExamplesStudied) ||
      safeExamplesStudied < 0 ||
      !Number.isFinite(safeQuestionsAnswered) ||
      safeQuestionsAnswered < 0
    ) {
      return res.status(400).json({ error: "Invalid learning history data." });
    }

    const safeDetailExamples = Array.isArray(detailExamples) ? detailExamples : [];
    const safeDetailPracticeQuestions = Array.isArray(detailPracticeQuestions) ? detailPracticeQuestions : [];

    const history = await LearningHistory.create({
      userId: req.auth.userId,
      skill: skill || "Learning Mode",
      subskill: subskill || "",
      difficulty: difficulty || "GED-Level",
      examplesStudied: safeExamplesStudied,
      questionsAnswered: safeQuestionsAnswered,
      correctCount: safeCorrectCount,
      incorrectCount: safeIncorrectCount,
      totalQuestions: safeTotalQuestions,
      detailExamples: safeDetailExamples,
      detailPracticeQuestions: safeDetailPracticeQuestions,
      completedAt: completedAt ? new Date(completedAt) : new Date()
    });

    return res.json({
      success: true,
      historyId: history._id
    });
  } catch (error) {
    console.error("COMPLETE LEARNING ERROR:");
    console.error(error);
    return res.status(500).json({ error: "Failed to save completed learning session." });
  }
});

app.get("/api/learning/history", authMiddleware, async (req, res) => {
  try {
    const history = await LearningHistory.find({ userId: req.auth.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json({ history });
  } catch (error) {
    console.error("GET LEARNING HISTORY ERROR:");
    console.error(error);
    return res.status(500).json({ error: "Failed to load learning history." });
  }
});

app.use("/api", (req, res) => {
  return res.status(404).json({
    error: `API route not found: ${req.method} ${req.originalUrl}`
  });
});

app.use((err, req, res, next) => {
  console.error("EXPRESS ERROR HANDLER:");
  console.error(err);

  if (
    err &&
    (err.type === "entity.too.large" || err.status === 413 || err.statusCode === 413)
  ) {
    return res.status(413).json({
      error: "Request payload too large.",
      code: "PAYLOAD_TOO_LARGE",
      limit: REQUEST_BODY_LIMIT
    });
  }

  if (req.originalUrl && req.originalUrl.startsWith("/api/")) {
    return res.status(500).json({
      error: err.message || "Server error.",
      code: err.code || null,
      command: err.command || null
    });
  }

  return next(err);
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
