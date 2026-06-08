const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./routes/authRoutes");
const customerRoutes = require("./routes/customerRoutes");
const matchRoutes = require("./routes/matchRoutes");
const noteRoutes = require("./routes/noteRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/customers", noteRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "TDC Matchmaker API Running",
    endpoints: {
      auth: "POST /api/auth/login",
      customers: "GET /api/customers, GET /api/customers/:id",
      matches: "GET /api/matches/customers/:id/matches, POST /api/matches/send",
      notes: "GET /api/customers/:id/notes, POST /api/customers/:id/notes",
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;
const { checkGeminiStatus } = require("./services/aiService");

app.listen(PORT, async () => {
  console.log(`\n🚀 TDC Matchmaker API running on http://localhost:${PORT}`);
  console.log(`   Auth:      POST /api/auth/login`);
  console.log(`   Customers: GET  /api/customers`);
  console.log(`   Matches:   GET  /api/matches/customers/:id/matches`);
  console.log(`   Notes:     GET  /api/customers/:id/notes`);
  
  try {
    const aiStatus = await checkGeminiStatus();
    if (aiStatus.mode === "gemini") {
      console.log(`   Gemini AI: 🟢 Active (Verified)\n`);
    } else {
      console.log(`   Gemini AI: 🟡 Mock Mode (${aiStatus.status})\n`);
    }
  } catch (err) {
    console.log(`   Gemini AI: 🔴 Status Check Failed (${err.message})\n`);
  }
});