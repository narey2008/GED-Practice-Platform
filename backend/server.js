const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const buildTest = require("./generators/testBuilder");
const User = require("./models/User");
const SavedProgress = require("./models/SavedProgress");
const TestHistory = require("./models/TestHistory");
const authMiddleware = require("./middleware/auth");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const requiredEnv = ["MONGODB_URI", "JWT_SECRET"];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
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
    createdAt: user.createdAt
  };
}

app.get("/api/health", async (req, res) => {
  const dbState = mongoose.connection.readyState;
  res.json({
    ok: true,
    databaseConnected: dbState === 1
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

    const user = await User.create({
      email: rawEmail,
      displayName: displayNameRaw || rawEmail.split("@")[0],
      passwordHash
    });

    const token = createToken(user);

    return res.status(201).json({
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error("REGISTER ERROR:");
    console.error(error);
    return res.status(500).json({
      error: error.message || "Failed to create account."
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