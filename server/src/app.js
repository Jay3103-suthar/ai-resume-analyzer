const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

/* ================================
   MIDDLEWARE
================================ */

// ✅ ALLOW LOCAL + VERCEL FRONTEND
const allowedOrigins = [
  "http://localhost:5173",
  "https://ai-resume-analyzer-ten-sepia.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
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
const pdfRoutes = require("./routes/pdf");

app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/jd", jdRoutes);
app.use("/api/pdf", pdfRoutes);

/* ================================
   DATABASE + SERVER
================================ */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Mongo connected");

    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
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
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});
