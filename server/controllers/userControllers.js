const users = require("../models/users.js");
const jwt = require("jsonwebtoken");
const handleErrors = require("../utils/handleErros.js");
const {
  createAccessToken,
  createRefreshToken,
} = require("../utils/createToken");
const maxAge = 3 * 24 * 60 * 60;
const bcrypt = require("bcrypt");

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log(username, email, password);

    const newUser = new users({ username, email, password });
    await newUser.save();

    // Tokens
    const accessToken = createAccessToken(newUser);
    const refreshToken = createRefreshToken(newUser);

    // Store refresh token in httpOnly cookie

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    // Return access token in response
    res.status(200).json({
      user: { id: newUser._id, username: newUser.username },
      loggedIn: true,
      accessToken: accessToken,
    });
  } catch (error) {
    const errors = handleErrors(error);
    res.status(500).json({ errors, created: false });
  }
};
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  const user = await users.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    accessToken,
    user: { id: user._id, username: user.username },
  });
};

const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ error: "No token" });

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid refresh token" });

    const accessToken = createAccessToken({
      _id: user.id,
      username: user.username,
    });
    res.json({ accessToken });
  });
};
const checkUser = async (req, res) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ status: false, error: "Access token missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await users.findById(decoded.id).select("username email");

    if (!user) {
      return res.status(401).json({ status: false, error: "User not found" });
    }

    res.status(200).json({ status: true, user: user });
  } catch (err) {
    console.error("JWT verification error:", err.message);
    res
      .status(403)
      .json({ status: false, error: "Access token invalid or expired" });
  }
};

const getUser = async (req, res) => {
  // console.log("heheh");
  const user = await users
    .findOne({ username: req.params.username })
    .select("username email");
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
};
const logoutUser = (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  });
  console.log("hehe");
  res.json({ message: "Logged out" });
};

module.exports = {
  registerUser,
  loginUser,
  checkUser,
  logoutUser,
  refreshToken,
  getUser,
};
