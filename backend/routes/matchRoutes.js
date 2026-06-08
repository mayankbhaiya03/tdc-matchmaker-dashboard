const express = require("express");
const router = express.Router();
const { getMatches, sendMatch, generateIntro, getAIStatus, getMatchExplanation } = require("../controllers/matchController");

// Check Gemini API status
router.get("/ai-status", getAIStatus);

// Get matches for a specific customer
router.get("/customers/:id/matches", getMatches);

// Send a match suggestion (mock email)
router.post("/send", sendMatch);

// Generate AI intro email
router.post("/intro-email", generateIntro);

// Generate AI match explanation insight on-demand
router.post("/explain", getMatchExplanation);

module.exports = router;
