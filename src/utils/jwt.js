const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

function signToken(user) {
  return jwt.sign({
    id: user.id,
    username: user.username,
    role: user.role,
  });
}

function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { signToken, verifyToken };
