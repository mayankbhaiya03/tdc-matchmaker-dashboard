/**
 * generateData.js
 * ────────────────
 * Generates realistic Indian matchmaking profile data using Faker.js.
 *  - 20 assigned customers (the matchmaker's client list)
 *  - 120 matchmaking pool profiles (opposite-gender candidates)
 *
 * Run:  node data/generateData.js
 */

const { faker } = require("@faker-js/faker");
const fs = require("fs");
const path = require("path");

// ─── Indian-context lookup tables ────────────────────────────────────

const MALE_FIRST_NAMES = [
  "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan",
  "Krishna", "Ishaan", "Shaurya", "Atharv", "Advik", "Pranav", "Advaith",
  "Dhruv", "Kabir", "Ritvik", "Aarush", "Kayaan", "Darsh", "Virat", "Rohan",
  "Arnav", "Laksh", "Kunal", "Nikhil", "Rahul", "Varun", "Ankit", "Mohit",
  "Sahil", "Tushar", "Gaurav", "Harsh", "Yash", "Dev", "Neeraj", "Manish",
  "Rajat", "Karan", "Piyush", "Tanmay", "Siddhant", "Siddharth", "Akash",
  "Prateek", "Naveen", "Ashwin", "Vikram",
];

const FEMALE_FIRST_NAMES = [
  "Ananya", "Diya", "Aanya", "Aadhya", "Aarohi", "Anvi", "Anika", "Prisha",
  "Sara", "Myra", "Ishita", "Kiara", "Divya", "Riya", "Pooja", "Neha",
  "Sneha", "Priya", "Kavya", "Meera", "Nisha", "Swati", "Anjali", "Tanvi",
  "Kritika", "Shruti", "Pallavi", "Deepika", "Sonal", "Tanya", "Aishwarya",
  "Jhanvi", "Mahi", "Nikita", "Radhika", "Sakshi", "Simran", "Trisha",
  "Vrinda", "Gayatri", "Mansi", "Rashmi", "Aparna", "Bhavna", "Charvi",
  "Esha", "Garima", "Isha", "Jiya", "Lavanya",
];

const LAST_NAMES = [
  "Sharma", "Verma", "Gupta", "Singh", "Kumar", "Agarwal", "Jain", "Patel",
  "Reddy", "Iyer", "Nair", "Menon", "Chopra", "Malhotra", "Kapoor", "Mehta",
  "Shah", "Desai", "Pillai", "Rao", "Naidu", "Bhat", "Kulkarni", "Joshi",
  "Mishra", "Pandey", "Tiwari", "Srivastava", "Saxena", "Bansal", "Goel",
  "Chandra", "Rawat", "Thakur", "Chauhan", "Yadav", "Rajput", "Trivedi",
  "Bhatt", "Deshpande",
];

const CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata",
  "Ahmedabad", "Jaipur", "Lucknow", "Chandigarh", "Indore", "Nagpur",
  "Coimbatore", "Kochi", "Bhopal", "Vadodara", "Surat", "Noida", "Gurgaon",
];

const RELIGIONS = ["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Buddhist"];

const CASTES_BY_RELIGION = {
  Hindu: ["Brahmin", "Kshatriya", "Vaishya", "Kayastha", "Maratha", "Reddy", "Nair", "Iyer", "Patel", "Agarwal"],
  Muslim: ["Sunni", "Shia", "Sufi", "Bohra", "Khoja"],
  Christian: ["Catholic", "Protestant", "Syrian Christian", "CSI", "CNI"],
  Sikh: ["Jat Sikh", "Khatri", "Arora", "Ramgarhia", "Saini"],
  Jain: ["Digambar", "Shwetambar", "Sthanakavasi"],
  Buddhist: ["Navayana", "Theravada", "Mahayana"],
};

const MOTHER_TONGUES = [
  "Hindi", "English", "Marathi", "Tamil", "Telugu", "Kannada", "Bengali",
  "Gujarati", "Malayalam", "Punjabi", "Urdu", "Odia",
];

const LANGUAGES = [
  "Hindi", "English", "Marathi", "Tamil", "Telugu", "Kannada", "Bengali",
  "Gujarati", "Malayalam", "Punjabi", "Urdu", "Sanskrit", "French",
];

const COLLEGES = [
  "IIT Delhi", "IIT Bombay", "IIT Madras", "IIT Kanpur", "IIT Kharagpur",
  "BITS Pilani", "NIT Trichy", "NIT Warangal", "NIT Surathkal",
  "Delhi University", "Mumbai University", "Pune University",
  "Christ University", "Manipal University", "SRM University",
  "VIT Vellore", "Amity University", "Symbiosis Pune",
  "St. Xavier's College", "Lady Shri Ram College", "SRCC Delhi",
  "IIM Ahmedabad", "IIM Bangalore", "IIM Calcutta", "ISB Hyderabad",
  "SP Jain Mumbai", "XLRI Jamshedpur", "FMS Delhi",
  "AIIMS Delhi", "CMC Vellore", "NIFT Delhi",
  "NLU Delhi", "NALSAR Hyderabad", "NLSIU Bangalore",
];

const DEGREES = [
  "B.Tech", "B.E.", "B.Com", "BBA", "B.Sc", "BA", "B.Arch", "BCA",
  "MBBS", "BDS", "LLB", "B.Pharma", "B.Des",
  "M.Tech", "MBA", "M.Sc", "MA", "MCA", "MD", "MS", "LLM", "M.Com",
  "CA", "CS", "CFA", "PhD",
];

const COMPANIES = [
  "TCS", "Infosys", "Wipro", "HCL Technologies", "Tech Mahindra",
  "Google India", "Microsoft India", "Amazon India", "Flipkart", "Paytm",
  "Razorpay", "Swiggy", "Zomato", "PhonePe", "CRED",
  "Deloitte India", "EY India", "KPMG India", "PwC India", "McKinsey India",
  "Goldman Sachs", "JP Morgan", "Morgan Stanley", "HDFC Bank", "ICICI Bank",
  "Reliance Industries", "Tata Group", "Mahindra Group", "Bajaj Group",
  "Adani Group", "Godrej", "L&T", "Hindustan Unilever",
  "Apollo Hospitals", "Fortis Healthcare", "Max Healthcare",
  "Zee Media", "Times Group", "Byju's", "Unacademy",
];

const DESIGNATIONS = [
  "Software Engineer", "Senior Software Engineer", "Data Analyst",
  "Product Manager", "Business Analyst", "Consultant", "Associate",
  "Senior Associate", "Manager", "Senior Manager", "Vice President",
  "Chartered Accountant", "Doctor", "Surgeon", "Dentist", "Lawyer",
  "Advocate", "Architect", "Designer", "Marketing Manager",
  "HR Manager", "Financial Analyst", "Investment Banker",
  "Civil Engineer", "Mechanical Engineer", "Research Scientist",
  "Professor", "Lecturer", "Journalist", "Content Writer",
  "Entrepreneur", "Founder", "Director",
];

const STATUSES = ["New", "Active", "On Hold", "Matched", "Closed"];
const YES_NO_MAYBE = ["Yes", "No", "Maybe"];
const DIET = ["Vegetarian", "Non-Vegetarian", "Eggetarian", "Vegan"];
const FAMILY_TYPE = ["Joint", "Nuclear", "Semi-Nuclear"];
const MANGLIK = ["Yes", "No", "Partial (Anshik)", "Don't Know"];
const DRINKING = ["No", "Occasionally", "Socially", "Regular"];
const SMOKING = ["No", "Occasionally", "Yes"];

const FATHER_OCCUPATIONS = [
  "Retired Government Officer", "Businessman", "Doctor", "Engineer",
  "Teacher", "Farmer", "Lawyer", "Chartered Accountant", "Bank Manager",
  "Army Officer", "Police Officer", "Professor", "Contractor",
  "Self-Employed", "Retired", "Shop Owner",
];

const MOTHER_OCCUPATIONS = [
  "Homemaker", "Teacher", "Doctor", "Nurse", "Professor",
  "Bank Employee", "Government Officer", "Businesswoman",
  "Retired", "Self-Employed", "Lawyer", "Principal",
];

// ─── Helper utilities ────────────────────────────────────────────────

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, min, max) => {
  const n = faker.number.int({ min, max });
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return [...new Set(shuffled.slice(0, n))];
};

const generateDOB = (ageMin, ageMax) => {
  const age = faker.number.int({ min: ageMin, max: ageMax });
  const year = new Date().getFullYear() - age;
  const month = faker.number.int({ min: 1, max: 12 });
  const day = faker.number.int({ min: 1, max: 28 });
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

const generateHeight = (gender) => {
  // Heights in cm — realistic Indian ranges
  if (gender === "Male") {
    return faker.number.int({ min: 163, max: 188 });
  }
  return faker.number.int({ min: 150, max: 175 });
};

const generateIncome = () => {
  // Annual income in lakhs (LPA)
  const brackets = [
    { min: 3, max: 8, weight: 25 },
    { min: 8, max: 15, weight: 30 },
    { min: 15, max: 30, weight: 25 },
    { min: 30, max: 60, weight: 12 },
    { min: 60, max: 150, weight: 8 },
  ];
  const total = brackets.reduce((s, b) => s + b.weight, 0);
  let r = Math.random() * total;
  for (const b of brackets) {
    r -= b.weight;
    if (r <= 0) return faker.number.int({ min: b.min, max: b.max });
  }
  return faker.number.int({ min: 8, max: 20 });
};

const generatePhone = () => {
  const prefixes = ["98", "97", "96", "95", "94", "93", "91", "90", "89", "88", "87", "86", "85", "84", "83", "82", "81", "80", "79", "78", "77", "76", "75", "74", "73", "72", "71", "70"];
  return `+91 ${pick(prefixes)}${faker.string.numeric(8)}`;
};

// ─── Profile generator ───────────────────────────────────────────────

const generateProfile = (id, gender, isCustomer = false) => {
  const firstName = gender === "Male" ? pick(MALE_FIRST_NAMES) : pick(FEMALE_FIRST_NAMES);
  const lastName = pick(LAST_NAMES);
  const religion = pick(RELIGIONS);
  const caste = pick(CASTES_BY_RELIGION[religion]);
  const dob = generateDOB(23, 38);
  const age = new Date().getFullYear() - parseInt(dob.split("-")[0]);
  const city = pick(CITIES);
  const motherTongue = pick(MOTHER_TONGUES);
  const income = generateIncome();

  const profile = {
    id: `${isCustomer ? "CUS" : "PRF"}-${String(id).padStart(4, "0")}`,
    firstName,
    lastName,
    gender,
    dateOfBirth: dob,
    age,
    country: "India",
    city,
    height: generateHeight(gender),
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${faker.number.int({ min: 1, max: 99 })}@${pick(["gmail.com", "yahoo.co.in", "outlook.com", "hotmail.com"])}`,
    phone: generatePhone(),
    ugCollege: pick(COLLEGES),
    degree: pick(DEGREES),
    income, // in LPA
    incomeFormatted: income >= 100 ? `₹${(income / 100).toFixed(1)} Cr` : `₹${income} LPA`,
    currentCompany: pick(COMPANIES),
    designation: pick(DESIGNATIONS),
    maritalStatus: pick(["Never Married", "Divorced", "Widowed", "Awaiting Divorce"]),
    languagesKnown: pickN(LANGUAGES, 2, 5),
    siblings: `${faker.number.int({ min: 0, max: 3 })} Brother(s), ${faker.number.int({ min: 0, max: 3 })} Sister(s)`,
    caste,
    religion,
    wantKids: pick(YES_NO_MAYBE),
    openToRelocate: pick(YES_NO_MAYBE),
    openToPets: pick(YES_NO_MAYBE),

    // Additional Indian matrimonial fields
    motherTongue,
    gotra: religion === "Hindu" ? pick(["Bharadwaj", "Kashyap", "Vashishtha", "Gautam", "Sandilya", "Atri", "Jamadagni", "Vishwamitra", "Agastya", "Parashar", "N/A"]) : "N/A",
    manglikStatus: religion === "Hindu" ? pick(MANGLIK) : "N/A",
    diet: pick(DIET),
    drinking: pick(DRINKING),
    smoking: pick(SMOKING),
    familyType: pick(FAMILY_TYPE),
    fatherOccupation: pick(FATHER_OCCUPATIONS),
    motherOccupation: pick(MOTHER_OCCUPATIONS),
    familyIncome: `₹${faker.number.int({ min: 10, max: 80 })} LPA`,
    aboutMe: generateAboutMe(firstName, gender, city),
  };

  // Customer-specific fields
  if (isCustomer) {
    profile.status = pick(STATUSES);
    profile.assignedDate = faker.date
      .between({ from: "2025-01-01", to: "2026-06-01" })
      .toISOString()
      .split("T")[0];
    profile.matchmakerNotes = "";
  }

  return profile;
};

const generateAboutMe = (name, gender, city) => {
  const intros = [
    `${name} is a driven professional based in ${city} with a passion for personal growth and building meaningful relationships.`,
    `A well-grounded individual from ${city}, ${name} values family traditions while embracing modern perspectives.`,
    `${name} is a ${city}-based professional who believes in balancing career ambitions with a warm family life.`,
    `Originally from ${city}, ${name} is known for ${gender === "Male" ? "his" : "her"} dedication to both career and family values.`,
    `${name} is a ${city} resident with a strong work ethic and a deep appreciation for cultural roots and family bonds.`,
  ];
  return pick(intros);
};

// ─── Generate all data ───────────────────────────────────────────────

function generateAllData() {
  console.log("🔄 Generating matchmaking data...\n");

  // 20 assigned customers — balanced gender split
  const customers = [];
  for (let i = 1; i <= 10; i++) {
    customers.push(generateProfile(i, "Male", true));
  }
  for (let i = 11; i <= 20; i++) {
    customers.push(generateProfile(i, "Female", true));
  }

  // 120 matchmaking pool profiles — all genders for cross-matching
  const profiles = [];
  for (let i = 1; i <= 60; i++) {
    profiles.push(generateProfile(i, "Female"));
  }
  for (let i = 61; i <= 120; i++) {
    profiles.push(generateProfile(i, "Male"));
  }

  // Empty notes store
  const notes = {};

  // Write files
  const dataDir = path.join(__dirname);

  fs.writeFileSync(
    path.join(dataDir, "customers.json"),
    JSON.stringify(customers, null, 2),
    "utf-8"
  );
  console.log(`✅ customers.json — ${customers.length} customers generated`);
  console.log(`   Male: ${customers.filter((c) => c.gender === "Male").length}, Female: ${customers.filter((c) => c.gender === "Female").length}`);

  fs.writeFileSync(
    path.join(dataDir, "profiles.json"),
    JSON.stringify(profiles, null, 2),
    "utf-8"
  );
  console.log(`✅ profiles.json — ${profiles.length} profiles generated`);
  console.log(`   Male: ${profiles.filter((p) => p.gender === "Male").length}, Female: ${profiles.filter((p) => p.gender === "Female").length}`);

  fs.writeFileSync(
    path.join(dataDir, "notes.json"),
    JSON.stringify(notes, null, 2),
    "utf-8"
  );
  console.log(`✅ notes.json — empty notes store created`);

  console.log("\n🎉 Data generation complete!");
}

generateAllData();
