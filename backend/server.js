const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const buildTest = require("./generators/testBuilder");
const User = require("./models/User");
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