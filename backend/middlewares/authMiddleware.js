const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function requireAuth(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized:  No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
}

function generateToken(user) {
  const payload = {
    userId: user._id,
    login_name: user.login_name,
    first_name: user.first_name,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}

module.exports = { requireAuth, generateToken, JWT_SECRET };