# TDC Matchmaker Dashboard — MVP

An internal Matchmaker Dashboard and matching algorithm MVP built for the TDC team to manage customers, view profiles, assign matches, and record notes.

## 🔑 Login Credentials

| Username | Password |
|----------|----------|
| `admin`  | `admin123` |

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 (Vite 8), Tailwind CSS 4, React Router DOM 7 |
| Backend | Node.js, Express 5 |
| AI | Gemini API (mock-first, plug-and-play) |
| Data | Static JSON (Faker.js generated) |
| Icons | Lucide React |
| Notifications | react-hot-toast |

## 📁 Project Structure

```
tdc-matchmaker-dashboard/
├── backend/
│   ├── controllers/       # Route handlers (auth, customer, match, note)
│   ├── data/              # JSON data store + generator script
│   ├── routes/            # Express route definitions
│   ├── services/          # Matching engine + AI service
│   ├── server.js          # Express app entry point
│   └── .env               # Environment config
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page-level components
│   │   ├── services/      # API service layer
│   │   ├── App.jsx        # Router setup
│   │   └── index.css      # Global styles + Tailwind config
│   └── index.html
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Backend Setup
```bash
cd backend
npm install
node data/generateData.js   # Generate 20 customers + 120 profiles
npm run dev                  # Starts on http://localhost:5000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev                  # Starts on http://localhost:5173
```

### Enable Real AI (Optional)
Add your Gemini API key to `backend/.env`:
```
GEMINI_API_KEY=your_key_here
```
Restart the backend. No code changes needed.

## 📋 Features

### 1. Login
- Clean professional login screen
- Hardcoded credentials: `admin / admin123`
- Form validation + error toasts

### 2. Dashboard — Customer List
- View 20 assigned customers
- Search by name or city
- Filter by status (New, Active, On Hold, Matched, Closed)
- Color-coded status badges
- Click to open customer detail

### 3. Customer Detail View
Full biodata with all fields organized into sections:
- Personal Information (name, DOB, gender, height, city)
- Contact (email, phone)
- Education & Career (degree, college, company, designation, income)
- Family & Background (religion, caste, mother tongue, siblings, gotra, manglik status)
- Lifestyle & Preferences (diet, drinking, smoking, want kids, relocate, pets)

### 4. Matching Algorithm
Gender-specific matching with 12 weighted factors:

**Male Customers → Female Profiles:**
- Age (prefer younger), Income (prefer less), Height (prefer shorter)
- Want Kids alignment, Religion/Caste match, City/Relocation

**Female Customers → Male Profiles:**
- Profession compatibility, Values/Religion, Relocation alignment
- Age (prefer older), Income (prefer higher), Education level

Each match includes:
- Compatibility score (0-100%)
- Match tier (High Potential / Good Match / Possible Match / Low Compatibility)
- Factor-by-factor breakdown
- AI-generated explanation

### 5. AI Integration
- **Match Explanations** — Natural-language reasoning for each match
- **Intro Email Generation** — Personalized matchmaker emails
- **Architecture** — Mock-first, Gemini API plug-and-play

### 6. Send Match Action (Two-Way Notification)
- "Send Match" button on each suggestion
- Modal with match profile summary
- **Two email tabs** — one intro email to the customer, one to the match profile
- AI-generated editable intro emails for both parties
- Mock email send to **both parties** with confirmation toast
- Backend logs both mock emails to the server console

### 7. Notes
- Add meeting/call/general notes per customer
- Timestamped, chronological display
- Persists to JSON file

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with credentials |
| GET | `/api/customers` | List customers (search, status filter) |
| GET | `/api/customers/:id` | Get customer by ID |
| GET | `/api/matches/customers/:id/matches` | Get scored matches |
| POST | `/api/matches/send` | Send match suggestion to both parties |
| POST | `/api/matches/intro-email` | Generate AI intro emails (both directions) |
| GET | `/api/customers/:id/notes` | Get customer notes |
| POST | `/api/customers/:id/notes` | Add a note |

## 🧠 How AI is Used

The AI service (`backend/services/aiService.js`) uses a **dual-mode architecture**:

1. **With Gemini API Key**: Calls Google Gemini 2.0 Flash to generate natural-language match explanations and personalized intro emails using detailed profile context.

2. **Without API Key (Mock Mode)**: Uses an intelligent template engine that analyzes actual profile data (religion match, age difference, location, career compatibility) to construct contextual explanations. The mock is smart — it reads the profiles and writes different text based on what actually matches.

This approach ensures the app is fully functional without an API key while being one environment variable away from real AI.

## 📝 Assumptions Made

1. **No persistent auth** — MVP uses route-based navigation only, no JWT/sessions
2. **File-based data** — JSON files act as a mock database, suitable for MVP
3. **120 pool profiles** — 60 male + 60 female to ensure cross-gender matching
4. **Indian context** — Names, cities, colleges, companies, and matrimonial fields are India-specific
5. **Mock email** — "Send Match" logs to server console rather than sending real emails
6. **Matching weights** — Based on research of Indian matrimonial platforms (Shaadi.com, Jeevansathi) where religion, family planning, and community carry more weight
