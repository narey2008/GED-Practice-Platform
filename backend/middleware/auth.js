const jwt = require("jsonwebtoken");

module.exports = function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ error: "Authentication required." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.auth = {
      userId: decoded.userId,
      email: decoded.email
    };

    return next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};