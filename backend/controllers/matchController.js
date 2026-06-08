/**
 * Match Controller
 * Uses the matching engine to find and return scored matches.
 */

const path = require("path");
const fs = require("fs");
const { findMatches } = require("../services/matchingEngine");
const {
  generateMatchExplanation,
  generateIntroEmail: generateIntroEmailFn,
  generateReverseIntroEmail: generateReverseIntroEmailFn,
  checkGeminiStatus,
} = require("../services/aiService");

const customersPath = path.join(__dirname, "../data/customers.json");
const profilesPath = path.join(__dirname, "../data/profiles.json");

// In-memory cache for match insights: Key is `customerId_matchProfileId`
const insightCache = new Map();

/**
 * GET /api/customers/:id/matches
 * Returns top matches for a customer from the pool.
 */
const getMatches = async (req, res) => {
  try {
    const customers = JSON.parse(fs.readFileSync(customersPath, "utf-8"));
    const profiles = JSON.parse(fs.readFileSync(profilesPath, "utf-8"));

    const customer = customers.find((c) => c.id === req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Run matching engine
    const matches = findMatches(customer, profiles);

    // Filter to top 15 matches and attach cached AI insights if they exist
    const topMatches = matches.slice(0, 15);
    const matchesWithAI = topMatches.map((match) => {
      const cacheKey = `${customer.id}_${match.profile.id}`;
      return {
        ...match,
        aiExplanation: insightCache.get(cacheKey) || null,
      };
    });

    res.json({
      success: true,
      customer: {
        id: customer.id,
        name: `${customer.firstName} ${customer.lastName}`,
        gender: customer.gender,
      },
      count: matchesWithAI.length,
      data: matchesWithAI,
    });
  } catch (error) {
    console.error("Match error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/matches/explain
 * Generate (or fetch from cache) AI explanation for a single match.
 * Body: { customerId, matchProfileId, score }
 */
const getMatchExplanation = async (req, res) => {
  try {
    const { customerId, matchProfileId, score } = req.body;

    if (!customerId || !matchProfileId) {
      return res.status(400).json({
        success: false,
        message: "customerId and matchProfileId are required",
      });
    }

    const cacheKey = `${customerId}_${matchProfileId}`;

    // Return cached explanation if it exists
    if (insightCache.has(cacheKey)) {
      return res.json({
        success: true,
        aiExplanation: insightCache.get(cacheKey),
        cached: true,
      });
    }

    // Load details to generate explanation
    const customers = JSON.parse(fs.readFileSync(customersPath, "utf-8"));
    const profiles = JSON.parse(fs.readFileSync(profilesPath, "utf-8"));

    const customer = customers.find((c) => c.id === customerId);
    const matchProfile = profiles.find((p) => p.id === matchProfileId);

    if (!customer || !matchProfile) {
      return res.status(404).json({
        success: false,
        message: "Customer or match profile not found",
      });
    }

    // Call service to generate insight
    const activeScore = score || { score: 75, matchTier: "Compatible" };
    const explanation = await generateMatchExplanation(customer, matchProfile, activeScore);

    // Save to cache
    insightCache.set(cacheKey, explanation);

    res.json({
      success: true,
      aiExplanation: explanation,
      cached: false,
    });
  } catch (error) {
    console.error("AI Insight generation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/matches/send
 * "Send Match" action — notifies BOTH parties with personalized intro emails.
 * Body: { customerId, matchProfileId, introEmail, reverseIntroEmail }
 */
const sendMatch = async (req, res) => {
  try {
    const { customerId, matchProfileId, introEmail, reverseIntroEmail } = req.body;

    if (!customerId || !matchProfileId) {
      return res.status(400).json({
        success: false,
        message: "customerId and matchProfileId are required",
      });
    }

    // Load profiles to get match info
    const profiles = JSON.parse(fs.readFileSync(profilesPath, "utf-8"));
    const customers = JSON.parse(fs.readFileSync(customersPath, "utf-8"));

    const customer = customers.find((c) => c.id === customerId);
    const matchProfile = profiles.find((p) => p.id === matchProfileId);

    if (!customer || !matchProfile) {
      return res.status(404).json({
        success: false,
        message: "Customer or match profile not found",
      });
    }

    // Auto-update status to Matched if it wasn't Matched already
    if (customer.status !== "Matched") {
      customer.status = "Matched";
      fs.writeFileSync(customersPath, JSON.stringify(customers, null, 2), "utf-8");
      console.log(`[Auto-Update] Updated customer ${customer.firstName} status to 'Matched'`);
    }

    // Log mock emails to BOTH parties
    console.log("\n📧 ─── MOCK EMAIL #1 — TO CUSTOMER ──────────────");
    console.log(`   From: TDC Matchmaker`);
    console.log(`   To: ${customer.firstName} ${customer.lastName} (${customer.email})`);
    console.log(`   Subject: New Match Suggestion - ${matchProfile.firstName} ${matchProfile.lastName}`);
    console.log(`   Email Preview: ${(introEmail || "").substring(0, 100)}...`);
    console.log("──────────────────────────────────────────────────\n");

    console.log("📧 ─── MOCK EMAIL #2 — TO MATCH PROFILE ─────────");
    console.log(`   From: TDC Matchmaker`);
    console.log(`   To: ${matchProfile.firstName} ${matchProfile.lastName} (${matchProfile.email})`);
    console.log(`   Subject: New Match Suggestion - ${customer.firstName} ${customer.lastName}`);
    console.log(`   Email Preview: ${(reverseIntroEmail || "").substring(0, 100)}...`);
    console.log("──────────────────────────────────────────────────\n");

    res.json({
      success: true,
      message: `Match emails sent to both ${customer.firstName} and ${matchProfile.firstName}`,
      details: {
        customer: `${customer.firstName} ${customer.lastName}`,
        matchSuggestion: `${matchProfile.firstName} ${matchProfile.lastName}`,
        emailsSent: 2,
        recipients: [
          { name: `${customer.firstName} ${customer.lastName}`, email: customer.email, role: "customer" },
          { name: `${matchProfile.firstName} ${matchProfile.lastName}`, email: matchProfile.email, role: "match" },
        ],
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/ai/intro-email
 * Generate personalized intro emails for BOTH parties.
 * Body: { customerId, matchProfileId }
 */
const generateIntro = async (req, res) => {
  try {
    const { customerId, matchProfileId } = req.body;
    const customers = JSON.parse(fs.readFileSync(customersPath, "utf-8"));
    const profiles = JSON.parse(fs.readFileSync(profilesPath, "utf-8"));

    const customer = customers.find((c) => c.id === customerId);
    const matchProfile = profiles.find((p) => p.id === matchProfileId);

    if (!customer || !matchProfile) {
      return res.status(404).json({
        success: false,
        message: "Customer or match profile not found",
      });
    }

    // Generate emails for both parties in parallel
    const [emailToCustomer, emailToMatch] = await Promise.all([
      generateIntroEmailFn(customer, matchProfile),
      generateReverseIntroEmailFn(customer, matchProfile),
    ]);

    res.json({
      success: true,
      data: {
        introEmail: emailToCustomer,
        reverseIntroEmail: emailToMatch,
        customerName: `${customer.firstName} ${customer.lastName}`,
        matchName: `${matchProfile.firstName} ${matchProfile.lastName}`,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/matches/ai-status
 * Check Gemini API key status and return connectivity details.
 */
const getAIStatus = async (req, res) => {
  try {
    const status = await checkGeminiStatus();
    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getMatches, sendMatch, generateIntro, getAIStatus, getMatchExplanation };

