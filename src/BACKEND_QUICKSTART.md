# 🚀 Backend Quick Start Guide

## 🎯 Goal

Get Brand Sense backend running in **< 1 day** and integrate with frontend in **< 1 week**.

---

## ⚡ 15-Minute Setup

### 1. Choose Your Stack

**Option A: Node.js + Express** (Recommended for speed)
```bash
mkdir brandsense-backend
cd brandsense-backend
npm init -y
npm install express cors dotenv jsonwebtoken bcrypt pg openai
npm install -D typescript @types/node @types/express nodemon
npx tsc --init
```

**Option B: Python + FastAPI** (Recommended for AI workloads)
```bash
mkdir brandsense-backend
cd brandsense-backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-jose bcrypt openai python-dotenv
```

**Option C: Go + Fiber** (Recommended for performance)
```bash
mkdir brandsense-backend
cd brandsense-backend
go mod init brandsense
go get github.com/gofiber/fiber/v2
go get github.com/lib/pq
go get github.com/golang-jwt/jwt/v5
go get github.com/sashabaranov/go-openai
```

---

### 2. Set Up Database

**PostgreSQL (Recommended):**
```bash
# Install PostgreSQL
# macOS: brew install postgresql
# Ubuntu: sudo apt install postgresql
# Windows: Download from postgresql.org

# Create database
createdb brandsense

# Or use Docker
docker run --name brandsense-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=brandsense \
  -p 5432:5432 \
  -d postgres:15
```

**Run migrations:**
```sql
-- See schema in /database/schema.sql
-- Or copy from BACKEND_REQUIREMENTS.md section 1-5
```

---

### 3. Environment Variables

Create `.env`:
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/brandsense

# JWT
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Server
PORT=3000
NODE_ENV=development

# CORS
ALLOWED_ORIGINS=http://localhost:5173,https://brandsense.vercel.app

# Rate Limiting
RATE_LIMIT_PER_HOUR=100
REFRESH_LIMIT_PER_MONTH=15
```

---

### 4. Copy ChatGPT Prompts

Create `/prompts/chatgpt.js` (or `.py` / `.go`):

```javascript
// Copy all 4 prompt functions from frontend /lib/api.ts:
// - getBrandRiskReportPrompt() (line 228)
// - getSentimentAnalysisPrompt() (line 240)
// - getKeywordAnalysisPrompt() (line 315)
// - getBrandIdentityPrompt() (line 327)

export function getBrandRiskReportPrompt(brandName, location, language, timeframe) {
  return `You are an expert Brand Perception & Risk Analyst...`;
}

// ... etc
```

**⚠️ IMPORTANT:** These prompts are your product's core logic. Copy them exactly!

---

## 📋 Day 1 Checklist

### Morning (4 hours): Basic Setup

- [ ] **Project scaffolding** (30 min)
  - Initialize project with chosen stack
  - Set up TypeScript/linting
  - Create folder structure
  
- [ ] **Database setup** (1 hour)
  - Create PostgreSQL database
  - Run schema migrations
  - Test database connection
  
- [ ] **Authentication** (2.5 hours)
  - Implement signup endpoint
  - Implement signin endpoint
  - Add corporate email validation
  - Test with Postman/curl

**Lunch Break** ☕

### Afternoon (4 hours): Core Features

- [ ] **Project CRUD** (2 hours)
  - Create project endpoint
  - List projects endpoint
  - Get single project endpoint
  - Test with frontend
  
- [ ] **ChatGPT Integration - Part 1** (2 hours)
  - Set up OpenAI API connection
  - Copy prompt templates
  - Create basic analysis function
  - Test ChatGPT response

---

## 📋 Week 1 Plan

### Day 1: Setup + Auth + Project CRUD ✅ (see above)

### Day 2: ChatGPT Analysis (Full Day)

**Morning:**
- [ ] Implement background job queue (Bull/Celery/Asynq)
- [ ] Create ChatGPT analysis worker
- [ ] Handle all 4 analysis types (brand identity, sentiment, keyword, risk)

**Afternoon:**
- [ ] Parse ChatGPT responses into structured format
- [ ] Store results in `project_data` table
- [ ] Update project `dataStatus` states
- [ ] Test full analysis flow

### Day 3: Data Sync + Polish

**Morning:**
- [ ] Implement refresh mechanism
- [ ] Add refresh counter logic
- [ ] Set up monthly reset cron job

**Afternoon:**
- [ ] Add error handling for all endpoints
- [ ] Implement rate limiting
- [ ] Add request validation
- [ ] Write basic tests

### Day 4: Risk Reports

**Morning:**
- [ ] Implement report generation endpoint
- [ ] Store historical reports
- [ ] Add report listing endpoint

**Afternoon:**
- [ ] Test report generation
- [ ] Add Markdown export
- [ ] Polish error messages

### Day 5: Integration Testing

**Full Day:**
- [ ] Connect frontend to backend (update `VITE_API_BASE_URL`)
- [ ] Test complete user flow: signup → onboarding → dashboard
- [ ] Fix integration issues
- [ ] Performance optimization

---

## 🎯 Critical Implementation Notes

### 1. Corporate Email Validation

```javascript
// Node.js example
const FREE_EMAIL_PROVIDERS = [
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
  'live.com', 'aol.com', 'icloud.com', 'mail.com',
  'protonmail.com', 'yandex.com', 'zoho.com'
];

function isValidCorporateEmail(email) {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain && !FREE_EMAIL_PROVIDERS.includes(domain);
}
```

### 2. Async ChatGPT Processing

**DO NOT** block the API response waiting for ChatGPT.

**✅ Correct Flow:**
```
1. POST /api/projects → Return 201 immediately
2. Trigger background job
3. Job calls ChatGPT (10-30 seconds)
4. Job updates database
5. Frontend polls GET /api/projects/:id to check status
```

**❌ Wrong Flow:**
```
1. POST /api/projects → Wait for ChatGPT (30 seconds)
2. Return response → USER WAITS 30 SECONDS ⏰
```

### 3. ChatGPT Response Parsing (CRITICAL!)

**⚠️ THIS IS THE MOST IMPORTANT PART!**

ChatGPT returns **unstructured text**, but frontend expects **EXACT JSON structures**.

**YOU MUST:**
1. Force ChatGPT to return JSON (not text!)
2. Parse response into exact format
3. Validate against schema
4. Store structured JSON in database

**Read this before implementing:** [CHATGPT_RESPONSE_PARSING.md](CHATGPT_RESPONSE_PARSING.md)

**Quick Example:**
```javascript
// ❌ WRONG - Frontend can't use this!
const response = await chatGPT.ask("Analyze Nike...");
database.store(response); // Unstructured text!

// ✅ CORRECT - Frontend can render this perfectly
const completion = await openai.chat.completions.create({
  model: "gpt-4-turbo-preview",
  messages: [{ role: "user", content: promptWithJSONInstructions }],
  response_format: { type: "json_object" } // Force JSON!
});

const parsed = JSON.parse(completion.choices[0].message.content);
validateStructure(parsed); // Ensure matches frontend types
database.store(parsed); // Clean, structured JSON ✅
```

**Complete guide with validation examples:** CHATGPT_RESPONSE_PARSING.md

### 4. Rate Limiting Strategy

```javascript
// Use Redis for distributed rate limiting
const redis = require('redis');
const client = redis.createClient();

async function checkRateLimit(userId) {
  const key = `ratelimit:${userId}`;
  const count = await client.incr(key);
  
  if (count === 1) {
    await client.expire(key, 3600); // 1 hour
  }
  
  return count <= 100; // 100 requests per hour
}
```

---

## 🔧 Minimal Backend Template

### Node.js + Express

```javascript
// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const OpenAI = require('openai');

const app = express();
const db = new Pool({ connectionString: process.env.DATABASE_URL });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Middleware
app.use(cors({ origin: process.env.ALLOWED_ORIGINS }));
app.use(express.json());

// Auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, error: 'No token' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

// Routes
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, fullName } = req.body;
  
  // Validate corporate email
  const domain = email.split('@')[1];
  if (['gmail.com', 'yahoo.com'].includes(domain)) {
    return res.status(400).json({ success: false, error: 'Corporate email required' });
  }
  
  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Insert user
  const result = await db.query(
    'INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name',
    [email, passwordHash, fullName]
  );
  
  const user = result.rows[0];
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  
  res.status(201).json({
    success: true,
    data: { token, user },
    timestamp: new Date().toISOString()
  });
});

app.post('/api/projects', authMiddleware, async (req, res) => {
  const { name, market, language, timeframe, aiModel } = req.body;
  
  const result = await db.query(
    `INSERT INTO projects 
     (user_id, name, market, language, timeframe, ai_model, data_status, refreshes_left) 
     VALUES ($1, $2, $3, $4, $5, $6, 'pending', 15) 
     RETURNING *`,
    [req.userId, name, market, language, timeframe, aiModel]
  );
  
  const project = result.rows[0];
  
  // Trigger background job (implement with Bull/BullMQ)
  // analyzeProjectJob.add({ projectId: project.id });
  
  res.status(201).json({
    success: true,
    data: project,
    timestamp: new Date().toISOString()
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
```

---

## 🧪 Testing with Frontend

### 1. Update Frontend Environment

```bash
# Frontend .env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 2. Uncomment API Calls

In frontend `/lib/api.ts`, uncomment lines 68-73, 100-105, etc.

### 3. Test Flow

```bash
# Terminal 1: Start backend
npm run dev

# Terminal 2: Start frontend
cd ../brand-sense-frontend
npm run dev

# Browser: http://localhost:5173
# Sign up → Onboarding → Dashboard
```

---

## 🐛 Debugging Tips

### Issue: CORS errors

```javascript
// Add this to Express
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### Issue: JWT token not working

```javascript
// Frontend should send token like this:
fetch(`${API_BASE_URL}/projects`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Issue: ChatGPT takes too long

```javascript
// Add timeout to OpenAI calls
const completion = await openai.chat.completions.create({
  model: "gpt-4-turbo-preview",
  messages: [...],
  timeout: 45000  // 45 seconds max
});
```

---

## 📚 Essential Files to Copy

From frontend to backend:

1. **ChatGPT Prompts** → `/lib/api.ts` lines 223-334
2. **Type Definitions** → `/lib/types.ts` (convert to your language)
3. **Email Validation Logic** → `/components/SignUp.tsx` lines 14-18

---

## 🎯 Success Criteria

Backend is ready when:

1. ✅ Frontend can signup with corporate email
2. ✅ Frontend can create project
3. ✅ Project appears in dashboard
4. ✅ ChatGPT analysis completes (even if takes 30 seconds)
5. ✅ Dashboard shows real data (not mock)
6. ✅ Refresh button works
7. ✅ No CORS errors
8. ✅ No console errors in frontend

---

## 🚀 Deploy

### Backend (Recommended: Railway/Render/Fly.io)

```bash
# Railway CLI
railway login
railway init
railway add postgresql
railway up

# Your backend is live at: https://your-app.railway.app
```

### Update Frontend Environment

```bash
# Frontend .env.production
VITE_API_BASE_URL=https://your-app.railway.app/api
```

### Deploy Frontend

```bash
cd frontend
vercel --prod
```

**Done!** 🎉

---

## 📞 Need Help?

**Common Questions:**

- **Q: Can I use MongoDB instead of PostgreSQL?**  
  A: Yes, but you'll need to adjust schema. PostgreSQL recommended for JSONB support.

- **Q: Should I use OpenAI streaming?**  
  A: Optional. Good for UX, but adds complexity. Start without it.

- **Q: How do I test ChatGPT without API key?**  
  A: Use mock responses first, then add real API later.

- **Q: Do I need WebSocket for real-time updates?**  
  A: No. Polling works fine for MVP. Add WebSocket later if needed.

---

**You got this! Start with Day 1 checklist above.** 💪
