const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const { signToken } = require("../utils/jwt");
const authMiddleware = require("../middleware/auth");

router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({
      message: `Username and password required`,
    });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const info = db
      .prepare(`INSERT INTO users (username, password) VALUES (?, ?)`)
      .run(username, hash);
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(400).json({
        message: "Username already exits",
      });
    }

    res.status(500).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const row = db
    .prepare(
      `SELECT id, username, password, role FROM users WHERE username = ?`
    )
    .get(username);
  if (!row) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const match = await bcrypt.compare(password, row.password);
  if (!match)
    return res.status(400).json({
      message: "Invalid credentials",
    });

  const user = {
    id: row.id,
    username: row.username,
    role: row.role,
  };
  const token = signToken(user);

  res.json({
    user,
    token,
  });

  router.get("/me", authMiddleware.authenticateJWT, (req, res) => {
    res.json({ user: req.user });
  });
});

module.exports = router;
