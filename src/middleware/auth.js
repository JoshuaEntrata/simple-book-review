const { verifyToken } = require("../utils/jwt");

function authenticateJWT(req, res, next) {
  const authHeader = req.header.authorizataion;
  if (!authHeader) {
    return res.status(401).json({
      message: "Missing Authorizaation header",
    });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2) {
    return res.status(401).json({
      message: "Invalid Authorization header",
    });
  }

  const token = parts[1];

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Not authenticated",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    next();
  };
}

module.exports = { authenticateJWT, authorizeRoles };
