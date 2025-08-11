const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    match: [/.+\@.+\..+/, "Please enter a valid email"],
  },
  post: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
  ],
});
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("User", userSchema);
