const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const { signToken } = require("../utils/jwt");
const { authenticateJWT } = require("../middleware/auth");
const AuthService = require("../services/Auth.service");

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        message: `Username and password required`,
      });
    }

    const { user, token } = await AuthService.register(username, password);

    res.json({
      username: user.username,
      role: user.role,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        message: `Username and password required`,
      });
    }

    const { user, token } = await AuthService.login(username, password);

    res.json({
      username: user.username,
      role: user.role,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/me", authenticateJWT, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
