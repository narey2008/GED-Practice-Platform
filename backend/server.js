const express = require("express");
const cors = require("cors");
const path = require("path");
const buildTest = require("./generators/testBuilder");

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  "http://localhost:3000",
  "https://gedpracticeplatform.com",
  "https://www.gedpracticeplatform.com"
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});