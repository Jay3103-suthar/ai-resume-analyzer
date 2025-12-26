const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

/* ================================
   MIDDLEWARE
================================ */
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use("/uploads", express.static("uploads"));

/* ================================
   ROUTES
================================ */
const authRoutes = require("./routes/auth");
const resumeRoutes = require("./routes/resume");
const jdRoutes = require("./routes/jd");
const pdfRoutes = require("./routes/pdf"); // ✅ ADD THIS

app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/jd", jdRoutes);
app.use("/api/pdf", pdfRoutes); // ✅ ADD THIS

/* ================================
   DATABASE + SERVER
================================ */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Mongo connected");

    app.listen(process.env.PORT || 5001, () =>
      console.log(`🚀 Server running on port ${process.env.PORT || 5001}`)
    );
  })
  .catch((err) => {
    console.error("❌ Mongo connection error:", err);
    process.exit(1);
  });

/* ================================
   GLOBAL ERROR HANDLER
================================ */
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});
