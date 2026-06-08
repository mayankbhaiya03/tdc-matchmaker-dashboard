/**
 * aiService.js
 * ─────────────
 * Gemini-compatible AI service for match explanations and intro emails.
 *
 * Architecture:
 *  - If GEMINI_API_KEY is set → calls Google Gemini API
 *  - If no key → uses intelligent mock responses built from profile data
 *
 * To activate real AI:
 *  1. Add GEMINI_API_KEY=your_key_here to .env
 *  2. Restart the server
 *  No code changes needed.
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=`;

// ─── Gemini API Call ─────────────────────────────────────────────────

async function callGemini(prompt) {
  if (!GEMINI_API_KEY) return null;

  try {
    const response = await fetch(`${GEMINI_URL}${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 300,
        },
      }),
    });

    if (!response.ok) {
      console.warn(`Gemini API error: ${response.status} — falling back to mock`);
      return null;
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (error) {
    console.warn("Gemini API call failed:", error.message, "— using mock response");
    return null;
  }
}

// ─── Match Explanation ───────────────────────────────────────────────

/**
 * Generate a natural-language explanation of why two profiles match.
 */
async function generateMatchExplanation(customer, matchProfile, score) {
  const prompt = `You are an experienced Indian matrimonial matchmaker. Provide a brief 2-3 sentence explanation of why these two profiles are compatible. Be specific, warm, and professional.

Customer: ${customer.firstName} ${customer.lastName}, ${customer.age}y, ${customer.gender}, ${customer.city}, ${customer.designation} at ${customer.currentCompany}, ${customer.religion} ${customer.caste}, ${customer.degree} from ${customer.ugCollege}, Income: ${customer.incomeFormatted}, Diet: ${customer.diet}, Mother Tongue: ${customer.motherTongue}, Want Kids: ${customer.wantKids}, Open to Relocate: ${customer.openToRelocate}

Match: ${matchProfile.firstName} ${matchProfile.lastName}, ${matchProfile.age}y, ${matchProfile.gender}, ${matchProfile.city}, ${matchProfile.designation} at ${matchProfile.currentCompany}, ${matchProfile.religion} ${matchProfile.caste}, ${matchProfile.degree} from ${matchProfile.ugCollege}, Income: ${matchProfile.incomeFormatted}, Diet: ${matchProfile.diet}, Mother Tongue: ${matchProfile.motherTongue}, Want Kids: ${matchProfile.wantKids}, Open to Relocate: ${matchProfile.openToRelocate}

Compatibility Score: ${score.score}/100 (${score.matchTier})

Write the explanation in 2-3 sentences only. Do not include the score or tier in your response.`;

  // Try Gemini first
  const aiResponse = await callGemini(prompt);
  if (aiResponse) return aiResponse.trim();

  // Fall back to intelligent mock
  return generateMockExplanation(customer, matchProfile, score);
}

/**
 * Mock explanation builder — creates realistic, data-driven text.
 */
function generateMockExplanation(customer, matchProfile, score) {
  const parts = [];

  // Religion/community match
  if (customer.religion === matchProfile.religion) {
    if (customer.caste === matchProfile.caste) {
      parts.push(`Both belong to the ${customer.religion} ${customer.caste} community, providing a strong cultural foundation.`);
    } else {
      parts.push(`Both share ${customer.religion} values, which creates a solid base for compatibility.`);
    }
  }

  // Age compatibility
  const ageDiff = Math.abs(customer.age - matchProfile.age);
  if (ageDiff <= 5) {
    parts.push(`With an age difference of just ${ageDiff} year${ageDiff !== 1 ? "s" : ""}, they are well-matched in terms of life stage and maturity.`);
  }

  // Location
  if (customer.city === matchProfile.city) {
    parts.push(`Both are based in ${customer.city}, making the transition seamless.`);
  } else if (customer.openToRelocate === "Yes" || matchProfile.openToRelocate === "Yes") {
    parts.push(`While based in different cities, there is openness to relocation which supports this match.`);
  }

  // Family planning
  if (customer.wantKids === matchProfile.wantKids) {
    parts.push(`Their aligned views on starting a family make this a thoughtful pairing.`);
  }

  // Education/Career
  parts.push(`${matchProfile.firstName} is a ${matchProfile.designation} at ${matchProfile.currentCompany} with a ${matchProfile.degree}, complementing ${customer.firstName}'s professional background.`);

  // Diet
  if (customer.diet === matchProfile.diet) {
    parts.push(`Their shared ${customer.diet.toLowerCase()} diet preference adds to lifestyle compatibility.`);
  }

  // Mother tongue
  if (customer.motherTongue === matchProfile.motherTongue) {
    parts.push(`Both are ${customer.motherTongue}-speaking, easing communication with families.`);
  }

  // Pick the best 2-3 sentences
  const selected = parts.slice(0, 3);

  if (selected.length === 0) {
    return `${matchProfile.firstName} brings a complementary background with ${matchProfile.gender === "Female" ? "her" : "his"} experience as a ${matchProfile.designation} in ${matchProfile.city}. The profiles show potential for a meaningful connection based on shared values and life goals.`;
  }

  return selected.join(" ");
}

// ─── Intro Email Generation ─────────────────────────────────────────

/**
 * Generate a personalized introduction email for a match suggestion.
 */
async function generateIntroEmail(customer, matchProfile) {
  const prompt = `You are a professional Indian matchmaker at TDC (The Date Crew). Write a short, warm, and professional email introducing a potential match to a client.

Client: ${customer.firstName} ${customer.lastName}, ${customer.age}y, ${customer.gender}, ${customer.city}, ${customer.designation}
Match Being Suggested: ${matchProfile.firstName} ${matchProfile.lastName}, ${matchProfile.age}y, ${matchProfile.gender}, ${matchProfile.city}, ${matchProfile.designation} at ${matchProfile.currentCompany}, ${matchProfile.degree} from ${matchProfile.ugCollege}

Write the email in this format:
- Greeting to the client
- Brief, positive introduction of the match (2-3 sentences)
- Why this could be a good fit (1-2 sentences)
- Next steps suggestion
- Professional sign-off as "TDC Matchmaking Team"

Keep it under 150 words. Be professional but warm.`;

  const aiResponse = await callGemini(prompt);
  if (aiResponse) return aiResponse.trim();

  // Mock email
  return generateMockIntroEmail(customer, matchProfile);
}

/**
 * Mock intro email — template-based with profile data.
 */
function generateMockIntroEmail(customer, matchProfile) {
  const pronoun = matchProfile.gender === "Female" ? "She" : "He";
  const possessive = matchProfile.gender === "Female" ? "her" : "his";

  return `Dear ${customer.firstName},

We hope you're doing well! We're excited to share a profile that we believe aligns beautifully with what you're looking for.

We'd like to introduce you to ${matchProfile.firstName} ${matchProfile.lastName}, a ${matchProfile.age}-year-old ${matchProfile.designation} based in ${matchProfile.city}. ${pronoun} holds a ${matchProfile.degree} from ${matchProfile.ugCollege} and is currently working at ${matchProfile.currentCompany}. ${pronoun} comes from a ${matchProfile.familyType.toLowerCase()} family and ${possessive} interests and values show great compatibility with your profile.

We believe ${possessive} ${matchProfile.religion} background and ${matchProfile.motherTongue}-speaking family complement your own preferences well.

Would you like us to arrange an introduction? Feel free to reach out with any questions.

Warm regards,
TDC Matchmaking Team`;
}

// ─── Reverse Intro Email (to match profile about the customer) ──────

/**
 * Generate a personalized introduction email sent TO the match profile ABOUT the customer.
 * This is the reverse direction — notifying the other party.
 */
async function generateReverseIntroEmail(customer, matchProfile) {
  const prompt = `You are a professional Indian matchmaker at TDC (The Date Crew). Write a short, warm, and professional email introducing a potential match to a person in the matchmaking pool.

Person receiving this email: ${matchProfile.firstName} ${matchProfile.lastName}, ${matchProfile.age}y, ${matchProfile.gender}, ${matchProfile.city}, ${matchProfile.designation}
Match Being Suggested to them: ${customer.firstName} ${customer.lastName}, ${customer.age}y, ${customer.gender}, ${customer.city}, ${customer.designation} at ${customer.currentCompany}, ${customer.degree} from ${customer.ugCollege}

Write the email in this format:
- Greeting to the match profile person
- Brief, positive introduction of the customer (2-3 sentences)
- Why this could be a good fit (1-2 sentences)
- Next steps suggestion
- Professional sign-off as "TDC Matchmaking Team"

Keep it under 150 words. Be professional but warm.`;

  const aiResponse = await callGemini(prompt);
  if (aiResponse) return aiResponse.trim();

  // Mock email
  return generateMockReverseIntroEmail(customer, matchProfile);
}

/**
 * Mock reverse intro email — template-based with profile data.
 */
function generateMockReverseIntroEmail(customer, matchProfile) {
  const pronoun = customer.gender === "Female" ? "She" : "He";
  const possessive = customer.gender === "Female" ? "her" : "his";

  return `Dear ${matchProfile.firstName},

We hope you're doing well! We have an exciting match we'd love to share with you.

We'd like to introduce you to ${customer.firstName} ${customer.lastName}, a ${customer.age}-year-old ${customer.designation} based in ${customer.city}. ${pronoun} holds a ${customer.degree} from ${customer.ugCollege} and is currently working at ${customer.currentCompany}. ${pronoun} comes from a ${customer.familyType.toLowerCase()} family and ${possessive} interests and values show great compatibility with your profile.

We believe ${possessive} ${customer.religion} background and ${customer.motherTongue}-speaking family complement your preferences well.

Would you be open to an introduction? We'd love to help you both connect.

Warm regards,
TDC Matchmaking Team`;
}

async function checkGeminiStatus() {
  if (!GEMINI_API_KEY) {
    return { configured: false, status: "Missing API Key in .env", mode: "mock" };
  }
  try {
    const response = await fetch(`${GEMINI_URL}${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "ping" }] }],
        generationConfig: {
          maxOutputTokens: 5,
        },
      }),
    });

    if (response.ok) {
      return { configured: true, status: "Connected & Verified", mode: "gemini" };
    } else {
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData?.error?.message || "Unknown error";
      return {
        configured: true,
        status: `API Key set, but Gemini API returned status ${response.status} (${errMsg})`,
        mode: "mock",
      };
    }
  } catch (error) {
    return {
      configured: true,
      status: `API Key set, but connection failed: ${error.message}`,
      mode: "mock",
    };
  }
}

module.exports = { generateMatchExplanation, generateIntroEmail, generateReverseIntroEmail, checkGeminiStatus };
