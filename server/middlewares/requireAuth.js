// middleware/requireAuth.js
const jwt = require("jsonwebtoken");

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ error: "No token" });

  const token = authHeader.split(" ")[1];
  // console.log("token = ", token);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Token invalid or expired" });
    req.user = decoded;
    // console.log(" req.user = ",  req.user);
    next();
  });
};

module.exports = requireAuth;
