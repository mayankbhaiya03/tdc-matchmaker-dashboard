/**
 * matchingEngine.js
 * ─────────────────
 * Gender-specific matching algorithm for Indian matrimonial matchmaking.
 *
 * For Male customers → Match with Female profiles:
 *   - Prefer younger women (2-7 years)
 *   - Income compatibility
 *   - Shorter height
 *   - Want Kids alignment
 *   - Religion/caste
 *   - City/relocation
 *   - Marital status
 *   - Education
 *
 * For Female customers → Match with Male profiles:
 *   - Profession compatibility
 *   - Values (religion, family type)
 *   - Relocation alignment
 *   - Prefer older men (2-7 years)
 *   - Income (prefer higher)
 *   - Education
 *   - City compatibility
 *   - Want Kids alignment
 */

// ─── Scoring Functions ───────────────────────────────────────────────

/**
 * Score age compatibility (0-100)
 */
const scoreAge = (customerAge, profileAge, customerGender) => {
  const diff = customerGender === "Male"
    ? customerAge - profileAge  // Male: prefer younger woman
    : profileAge - customerAge; // Female: prefer older man

  if (diff >= 2 && diff <= 7) return 100;    // Ideal range
  if (diff >= 1 && diff <= 10) return 75;    // Acceptable
  if (diff >= 0 && diff <= 12) return 50;    // Possible
  if (diff >= -2 && diff <= 15) return 30;   // Stretch
  return 10;                                  // Unlikely
};

/**
 * Score income compatibility (0-100)
 */
const scoreIncome = (customerIncome, profileIncome, customerGender) => {
  if (customerGender === "Male") {
    // Male: prefer women who earn less (traditional Indian preference)
    if (profileIncome <= customerIncome) return 100;
    if (profileIncome <= customerIncome * 1.2) return 70;
    if (profileIncome <= customerIncome * 1.5) return 40;
    return 20;
  } else {
    // Female: prefer men who earn more
    if (profileIncome >= customerIncome) return 100;
    if (profileIncome >= customerIncome * 0.8) return 70;
    if (profileIncome >= customerIncome * 0.6) return 40;
    return 20;
  }
};

/**
 * Score height compatibility (0-100)
 */
const scoreHeight = (customerHeight, profileHeight, customerGender) => {
  const diff = customerGender === "Male"
    ? customerHeight - profileHeight  // Male: prefer shorter woman
    : profileHeight - customerHeight; // Female: prefer taller man

  if (diff >= 5 && diff <= 20) return 100;   // Ideal
  if (diff >= 0 && diff <= 25) return 75;    // Good
  if (diff >= -5 && diff <= 30) return 50;   // Acceptable
  return 25;                                  // Less compatible
};

/**
 * Score Want Kids alignment (0-100)
 */
const scoreWantKids = (customerPref, profilePref) => {
  if (customerPref === profilePref) return 100;
  if (customerPref === "Maybe" || profilePref === "Maybe") return 70;
  return 10; // Yes/No mismatch
};

/**
 * Score Religion compatibility (0-100)
 */
const scoreReligion = (customerReligion, profileReligion) => {
  if (customerReligion === profileReligion) return 100;
  return 20;
};

/**
 * Score Caste compatibility (0-100)
 */
const scoreCaste = (customerCaste, profileCaste, sameReligion) => {
  if (!sameReligion) return 20;
  if (customerCaste === profileCaste) return 100;
  return 50; // Same religion, different caste — somewhat compatible
};

/**
 * Score City / Relocation compatibility (0-100)
 */
const scoreLocation = (customerCity, profileCity, customerRelocate, profileRelocate) => {
  if (customerCity === profileCity) return 100;
  if (customerRelocate === "Yes" || profileRelocate === "Yes") return 80;
  if (customerRelocate === "Maybe" || profileRelocate === "Maybe") return 50;
  return 15;
};

/**
 * Score Marital Status compatibility (0-100)
 */
const scoreMaritalStatus = (customerStatus, profileStatus) => {
  if (customerStatus === profileStatus) return 100;
  if (customerStatus === "Never Married" && profileStatus === "Never Married") return 100;
  if (customerStatus === "Divorced" && profileStatus === "Divorced") return 90;
  if (customerStatus === "Never Married" && profileStatus !== "Never Married") return 40;
  return 50;
};

/**
 * Score Education compatibility (0-100)
 */
const scoreEducation = (customerDegree, profileDegree) => {
  const postgradDegrees = ["M.Tech", "MBA", "M.Sc", "MA", "MCA", "MD", "MS", "LLM", "M.Com", "CA", "CS", "CFA", "PhD"];
  const premiumColleges = ["IIT", "IIM", "BITS", "NIT", "AIIMS", "NLSIU", "NALSAR", "NLU", "ISB"];

  const customerPostgrad = postgradDegrees.includes(customerDegree);
  const profilePostgrad = postgradDegrees.includes(profileDegree);

  if (customerPostgrad && profilePostgrad) return 100;
  if (customerPostgrad === profilePostgrad) return 80;
  return 50;
};

/**
 * Score Diet compatibility (0-100)
 */
const scoreDiet = (customerDiet, profileDiet) => {
  if (customerDiet === profileDiet) return 100;
  const vegTypes = ["Vegetarian", "Vegan"];
  if (vegTypes.includes(customerDiet) && vegTypes.includes(profileDiet)) return 80;
  if (vegTypes.includes(customerDiet) && !vegTypes.includes(profileDiet)) return 30;
  return 60; // Non-veg customer, any diet profile is acceptable
};

/**
 * Score Mother Tongue compatibility (0-100)
 */
const scoreMotherTongue = (customerMT, profileMT) => {
  if (customerMT === profileMT) return 100;
  // Hindi-speaking compatibility
  if (["Hindi", "Urdu"].includes(customerMT) && ["Hindi", "Urdu"].includes(profileMT)) return 80;
  return 40;
};

/**
 * Score Family Type compatibility (0-100)
 */
const scoreFamilyType = (customerFT, profileFT) => {
  if (customerFT === profileFT) return 100;
  if (customerFT === "Semi-Nuclear" || profileFT === "Semi-Nuclear") return 70;
  return 40;
};

// ─── Main Matching Function ──────────────────────────────────────────

/**
 * Find and score matches for a given customer from the profile pool.
 * @param {Object} customer - The customer to find matches for
 * @param {Array} profiles - The matchmaking pool
 * @returns {Array} Sorted matches with scores and breakdowns
 */
const findMatches = (customer, profiles) => {
  // Filter to opposite gender only
  const oppositeGender = customer.gender === "Male" ? "Female" : "Male";
  const candidates = profiles.filter((p) => p.gender === oppositeGender);

  const scored = candidates.map((profile) => {
    const sameReligion = customer.religion === profile.religion;

    // Calculate individual factor scores
    const factors = {};

    if (customer.gender === "Male") {
      // ──── MALE CUSTOMER matching weights ────
      factors.age =         { score: scoreAge(customer.age, profile.age, "Male"),                                    weight: 0.15, label: "Age Compatibility" };
      factors.income =      { score: scoreIncome(customer.income, profile.income, "Male"),                           weight: 0.08, label: "Income Compatibility" };
      factors.height =      { score: scoreHeight(customer.height, profile.height, "Male"),                           weight: 0.07, label: "Height Compatibility" };
      factors.wantKids =    { score: scoreWantKids(customer.wantKids, profile.wantKids),                             weight: 0.18, label: "Family Planning" };
      factors.religion =    { score: scoreReligion(customer.religion, profile.religion),                             weight: 0.14, label: "Religion" };
      factors.caste =       { score: scoreCaste(customer.caste, profile.caste, sameReligion),                        weight: 0.05, label: "Community" };
      factors.location =    { score: scoreLocation(customer.city, profile.city, customer.openToRelocate, profile.openToRelocate), weight: 0.10, label: "Location" };
      factors.maritalStatus = { score: scoreMaritalStatus(customer.maritalStatus, profile.maritalStatus),            weight: 0.08, label: "Marital Status" };
      factors.education =   { score: scoreEducation(customer.degree, profile.degree),                                weight: 0.05, label: "Education" };
      factors.diet =        { score: scoreDiet(customer.diet, profile.diet),                                         weight: 0.04, label: "Diet" };
      factors.motherTongue = { score: scoreMotherTongue(customer.motherTongue, profile.motherTongue),                weight: 0.03, label: "Language" };
      factors.familyType =  { score: scoreFamilyType(customer.familyType, profile.familyType),                       weight: 0.03, label: "Family Type" };
    } else {
      // ──── FEMALE CUSTOMER matching weights ────
      factors.age =         { score: scoreAge(customer.age, profile.age, "Female"),                                  weight: 0.12, label: "Age Compatibility" };
      factors.income =      { score: scoreIncome(customer.income, profile.income, "Female"),                         weight: 0.10, label: "Income Stability" };
      factors.height =      { score: scoreHeight(customer.height, profile.height, "Female"),                         weight: 0.05, label: "Height Compatibility" };
      factors.wantKids =    { score: scoreWantKids(customer.wantKids, profile.wantKids),                             weight: 0.12, label: "Family Planning" };
      factors.religion =    { score: scoreReligion(customer.religion, profile.religion),                             weight: 0.14, label: "Values & Religion" };
      factors.caste =       { score: scoreCaste(customer.caste, profile.caste, sameReligion),                        weight: 0.05, label: "Community" };
      factors.location =    { score: scoreLocation(customer.city, profile.city, customer.openToRelocate, profile.openToRelocate), weight: 0.12, label: "Relocation" };
      factors.maritalStatus = { score: scoreMaritalStatus(customer.maritalStatus, profile.maritalStatus),            weight: 0.08, label: "Marital Status" };
      factors.education =   { score: scoreEducation(customer.degree, profile.degree),                                weight: 0.08, label: "Education" };
      factors.diet =        { score: scoreDiet(customer.diet, profile.diet),                                         weight: 0.05, label: "Diet" };
      factors.motherTongue = { score: scoreMotherTongue(customer.motherTongue, profile.motherTongue),                weight: 0.05, label: "Language" };
      factors.familyType =  { score: scoreFamilyType(customer.familyType, profile.familyType),                       weight: 0.04, label: "Family Type" };
    }

    // Calculate weighted total score
    let totalScore = 0;
    const breakdown = [];

    for (const [key, factor] of Object.entries(factors)) {
      const weightedScore = factor.score * factor.weight;
      totalScore += weightedScore;
      breakdown.push({
        factor: factor.label,
        score: Math.round(factor.score),
        weight: Math.round(factor.weight * 100),
        weightedScore: Math.round(weightedScore),
      });
    }

    totalScore = Math.round(totalScore);

    // Determine match tier
    let matchTier;
    if (totalScore >= 75) matchTier = "High Potential";
    else if (totalScore >= 55) matchTier = "Good Match";
    else if (totalScore >= 40) matchTier = "Possible Match";
    else matchTier = "Low Compatibility";

    return {
      profile,
      score: totalScore,
      matchTier,
      breakdown: breakdown.sort((a, b) => b.weightedScore - a.weightedScore),
    };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  return scored;
};

module.exports = { findMatches };
