const express = require("express");
const {
  registerUser,
  loginUser,
  checkUser,
  logoutUser,
  refreshToken,
  getUser,
} = require("../controllers/userControllers");
const router = express.Router(); // ✅ Correct usage
router.get('/users', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const users = await User.find().limit(limit);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshToken);
router.post("/checkuser", checkUser);
router.get("/:username",getUser)
router.post("/logout", logoutUser);
module.exports = router;
