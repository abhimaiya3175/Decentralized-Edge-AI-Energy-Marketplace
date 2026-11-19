const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : (authHeader && authHeader.includes(" ") ? authHeader.split(" ")[1] : null);

    if (!token) {
      return res.status(401).json({ msg: "No token provided", code: "TOKEN_MISSING" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ msg: "Token has expired", code: "TOKEN_EXPIRED" });
    }
    return res.status(401).json({ msg: "Invalid Token", code: "TOKEN_INVALID" });
  }
};
