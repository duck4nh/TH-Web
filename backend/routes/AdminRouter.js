const express = require("express");
const router = express.Router();
const User = require("../db/userModel");
const { generateToken } = require("../middlewares/authMiddleware");


router.post("/login", async (req, res) => {
  const { login_name, password } = req.body;

  if (!login_name || !password) {
    return res.status(400).json({ error: "login_name and password are required" });
  }
  try {
    const user = await User.findOne({ login_name });
    if (!user) {
      return res.status(400).json({ error: "Invalid login_name or password" });
    }
    if (user.password !== password) {
      return res.status(400).json({ error: "Invalid login_name or password" });
    }
    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "lax",
    });
    return res.status(200).json({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      login_name: user.login_name,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/logout", (req, res) => {
  if (!req.cookies.token) {
    return res.status(400).json({ error: "No user is currently logged in" });
  }
  res.cookie("token", "", {
    httpOnly: true,
    maxAge: 0,
  });
  return res.status(200).json({ message: "Logout successful" });
});

router.get("/whoami", async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const jwt = require("jsonwebtoken");
    const { JWT_SECRET } = require("../middlewares/authMiddleware");
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User. findById(decoded.userId, { password: 0 });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      _id: user._id,
      first_name: user.first_name,
      last_name:  user.last_name,
      login_name: user.login_name,
    });
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;