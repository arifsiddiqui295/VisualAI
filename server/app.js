var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var userRoutes = require("./routes/userRoutes");
var imageRoutes = require("./routes/imageRoutes");
var app = express();
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
connectDB();
app.use(logger("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/users", userRoutes);
app.use("/api/images", imageRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// error handler
// error handler for API
app.use(function (err, req, res, next) {
  console.error("Unhandled error:", err.message);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    stack: req.app.get("env") === "development" ? err.stack : undefined,
  });
});

module.exports = app;
