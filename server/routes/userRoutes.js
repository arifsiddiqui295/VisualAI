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
router.get("/", function (req, res, next) {
  // res.render("index", { title: "Express" });
  res.json("ehelloworld");
  // console.log("heheh");
});
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshToken);
router.post("/checkuser", checkUser);
router.get("/:username",getUser)
router.post("/logout", logoutUser);
module.exports = router;
