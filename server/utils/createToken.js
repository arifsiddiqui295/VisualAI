// utils/createTokens.js
const jwt = require("jsonwebtoken");

const createAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" } // short-lived
  );
};

const createRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" } // long-lived
  );
};

module.exports = { createAccessToken, createRefreshToken };
