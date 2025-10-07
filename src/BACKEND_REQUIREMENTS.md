# 🔧 Brand Sense - Backend Integration Requirements

## 📋 Executive Summary

Brand Sense frontend is **100% ready** for backend integration. This document provides everything your backend team needs to implement the API layer.

**Tech Stack:**
- Frontend: React + TypeScript + Vite
- Backend: **Your choice** (Node.js/Python/Go recommended)
- Database: **Your choice** (PostgreSQL/MongoDB recommended)
- AI: OpenAI ChatGPT API (GPT-4 or GPT-5)

---

## 🎯 Core Requirements

### 1. Authentication & User Management

#### Endpoints Needed:

```typescript
POST /api/auth/signup
POST /api/auth/signin
POST /api/auth/signout
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/session
```

#### Business Rules:

- **Corporate Email Only**: Block free email providers (gmail.com, yahoo.com, etc.)
- **No Email Verification in MVP**: Users get immediate access (can add later)
- Store user profile with: name, email, company, position
- Session management (JWT recommended)

#### Database Schema - Users:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  company VARCHAR(255),
  position VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP
);
```

---

### 2. Project Management

#### Endpoints Needed:

```typescript
POST   /api/projects              // Create project (admin only)
GET    /api/projects              // List user's projects
GET    /api/projects/:id          // Get single project
DELETE /api/projects/:id          // Delete project
POST   /api/projects/:id/refresh  // Manual data refresh

// REMOVED: PUT /api/projects/:id - Projects cannot be edited after creation
```

#### Database Schema - Projects:

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,              -- Brand Name
  market VARCHAR(255) NOT NULL,            -- e.g., "Turkey"
  language VARCHAR(100) NOT NULL,          -- e.g., "Turkish"
  timeframe VARCHAR(50) NOT NULL,          -- e.g., "Last 3 months"
  ai_model VARCHAR(50) DEFAULT 'gpt-4o',
  industry VARCHAR(255),
  website_url VARCHAR(500),
  data_status VARCHAR(20) DEFAULT 'pending',  -- pending | processing | ready | error
  refreshes_left INT DEFAULT 15,              -- 15 per month
  last_refresh_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  error_message TEXT
);
```

#### Project Creation Flow:

1. **Frontend**: User completes onboarding → `POST /api/projects`
2. **Backend**: 
   - Create project record with `data_status: 'pending'`
   - Return project ID immediately
   - Trigger async ChatGPT analysis job
3. **Background Job**: 
   - Update `data_status` to `'processing'`
   - Call ChatGPT API (see section 3)
   - Store results in `project_data` table
   - Update `data_status` to `'ready'` or `'error'`

---

### 3. ChatGPT Integration (CRITICAL)

#### Required API Calls:

The frontend expects **4 types of ChatGPT analyses**:

1. **Brand Identity Analysis**
2. **Sentiment Analysis**
3. **Keyword Analysis**
4. **Risk Report Generation**

#### Frontend Request Format:

```typescript
// Frontend sends this to YOUR backend
interface ChatGPTAnalysisRequest {
  brandName: string;      // e.g., "Nike"
  location: string;       // e.g., "Turkey"
  language: string;       // e.g., "Turkish"
  timeframe: string;      // e.g., "Last 3 months"
  aiModel: string;        // e.g., "gpt-4o"
  analysisType: 'full' | 'brand-identity' | 'sentiment' | 'keyword';
}
```

#### Backend → ChatGPT Integration:

**⚠️ CRITICAL: ChatGPT Response Parsing Required!**

ChatGPT returns **unstructured text**. You MUST parse responses into **exact structured JSON format** that frontend expects.

**See CHATGPT_RESPONSE_PARSING.md for complete parsing guide!**

**Option A: Direct OpenAI API with JSON Mode** (Recommended)
```bash
# Install OpenAI SDK
npm install openai
# or
pip install openai
```

```javascript
// ALWAYS use JSON mode to force structured output
const completion = await openai.chat.completions.create({
  model: "gpt-4-turbo-preview",
  messages: [{ role: "user", content: prompt }],
  response_format: { type: "json_object" } // ← CRITICAL!
});

const parsed = JSON.parse(completion.choices[0].message.content);
validateAgainstSchema(parsed); // Ensure matches frontend types
```

**Option B: LangChain** (For complex pipelines)
```bash
npm install langchain
```

#### Endpoint Implementation:

```typescript
POST /api/projects/:id/analyze
Request Body: ChatGPTAnalysisRequest
Response: ChatGPTResponse<ProjectData>

// Background job processes this
// MUST parse ChatGPT response before storing!
```

---

### 4. ChatGPT Prompts & Response Parsing (CRITICAL!)

**⚠️ PARSING IS MANDATORY!**

Frontend components expect **EXACT JSON structures**. ChatGPT returns text. You MUST parse responses before storing.

**Complete parsing guide:** [CHATGPT_RESPONSE_PARSING.md](CHATGPT_RESPONSE_PARSING.md)

**Quick Summary:**
1. Modify prompts to request JSON format
2. Use OpenAI's `response_format: { type: "json_object" }`
3. Parse response into structured format
4. Validate against frontend types
5. Store in database

**Prompt Templates (Copy from `/lib/api.ts` lines 223-334):**

1. `getBrandRiskReportPrompt()` - Lines 228-235
2. `getSentimentAnalysisPrompt()` - Lines 240-310
3. `getKeywordAnalysisPrompt()` - Lines 315-322
4. `getBrandIdentityPrompt()` - Lines 327-334

**⚠️ These prompts MUST be modified to request JSON output!**  
See CHATGPT_RESPONSE_PARSING.md for updated JSON-mode prompts.

#### Example Backend Implementation (Node.js):

```javascript
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function analyzeBrandIdentity(request) {
  // Get the prompt (modified to request JSON - see CHATGPT_RESPONSE_PARSING.md)
  const prompt = getBrandIdentityPromptJSON(
    request.brandName,
    request.location,
    request.language,
    request.timeframe
  );
  
  // Call ChatGPT with JSON mode
  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      { role: "system", content: "You are a brand analyst. Always respond with valid JSON only." },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" }, // ← Force JSON output
    temperature: 0.7,
    max_tokens: 4000
  });
  
  // Parse and validate
  const parsed = JSON.parse(completion.choices[0].message.content);
  validateBrandIdentityData(parsed); // Ensure matches frontend schema
  
  return parsed; // Clean, structured JSON
}

// Validation function
function validateBrandIdentityData(data) {
  if (!data.bpmData || data.bpmData.length !== 4) {
    throw new Error('Invalid BPM data: must have 4 metrics');
  }
  if (!data.toneData || data.toneData.length !== 6) {
    throw new Error('Invalid tone data: must have 6 metrics');
  }
  // ... more validation (see CHATGPT_RESPONSE_PARSING.md)
  return true;
}
```

**⚠️ See CHATGPT_RESPONSE_PARSING.md for:**
- Complete validation logic
- All required JSON structures
- Updated prompts for JSON mode
- Error handling strategies

---

### 5. Data Storage Structure

#### Database Schema - Project Data:

```sql
CREATE TABLE project_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  data_type VARCHAR(50) NOT NULL,  -- 'brand_identity' | 'sentiment' | 'keyword' | 'risk_report'
  data JSONB NOT NULL,              -- ChatGPT response data
  generated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(project_id, data_type)
);
```

#### Expected JSON Structure:

**Brand Identity Data:**
```json
{
  "bpmData": [
    { "name": "Visibility", "score": 85, "description": "..." },
    { "name": "Consistency", "score": 78, "description": "..." }
  ],
  "totalBPM": 81.5,
  "toneData": [
    { "trait": "Innovation", "fullName": "Innovation", "score": 88 }
  ],
  "brandPowerStatement": "Nike is perceived as...",
  "keyAssociations": ["sports", "innovation", "empowerment"]
}
```

**Sentiment Analysis Data:**
```json
{
  "overallSummary": "Nike enjoys predominantly positive sentiment...",
  "primarySentiments": [
    { "category": "Positive", "score": 72, "colorType": "success", "themes": "..." }
  ],
  "emotionalClusters": [
    { "name": "Excitement", "score": 85, "explanation": "..." }
  ],
  "sentimentProfile": [
    { "dimension": "Trust", "score": 80, "trend": "up", "themes": "...", "summary": "..." }
  ]
}
```

**Keyword Analysis Data:**
```json
{
  "summary": "Nike's visibility is dominated by...",
  "keywords": [
    {
      "keyword": "sports",
      "visibility": 95,
      "trend": "up",
      "tone": "Positive",
      "share": 12.5,
      "explanation": "..."
    }
  ]
}
```

See `/lib/types.ts` (lines 26-111) for complete TypeScript definitions.

---

### 6. API Response Format

All endpoints must follow this response structure:

```typescript
interface ChatGPTResponse<T> {
  success: boolean;
  data: T | null;
  timestamp: string;
  error?: string;
}
```

**Success Example:**
```json
{
  "success": true,
  "data": { /* ProjectData object */ },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Error Example:**
```json
{
  "success": false,
  "data": null,
  "timestamp": "2025-01-15T10:30:00Z",
  "error": "ChatGPT API rate limit exceeded"
}
```

---

### 7. Refresh Mechanism

#### Business Logic:

- Each user gets **15 refreshes per month** per project
- Refresh counter resets on the 1st of each month
- Manual refresh triggered by user clicking "Refresh" button

#### Implementation:

```typescript
POST /api/projects/:id/refresh

// Backend logic:
1. Check if refreshes_left > 0
2. If yes:
   - Decrement refreshes_left
   - Set data_status to 'processing'
   - Trigger ChatGPT analysis job
   - Return 202 Accepted
3. If no:
   - Return 429 Too Many Requests
```

#### Database Schema - Refresh Counter:

```sql
CREATE TABLE refresh_counters (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  month VARCHAR(7) NOT NULL,  -- e.g., "2025-01"
  refreshes_used INT DEFAULT 0,
  PRIMARY KEY (user_id, project_id, month)
);
```

---

### 8. Risk Reports

#### Endpoints:

```typescript
POST /api/reports/generate
GET  /api/reports/:id
GET  /api/reports?projectId=:projectId
```

#### Database Schema - Risk Reports:

```sql
CREATE TABLE risk_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  report_content TEXT NOT NULL,      -- Markdown formatted report
  generated_at TIMESTAMP DEFAULT NOW()
);
```

#### Frontend Expects:

- Risk report in **Markdown format**
- Generated using the prompt in `/lib/api.ts` line 228
- Stored separately from project_data (historical reports)

---

## 🚀 Integration Steps

### Phase 1: Authentication (Week 1)

- [ ] Implement user signup/signin endpoints
- [ ] Add corporate email validation
- [ ] Set up JWT authentication
- [ ] Test with frontend

### Phase 2: Project Management (Week 1-2)

- [ ] Create project CRUD endpoints
- [ ] Set up database schema
- [ ] Test project creation flow
- [ ] Implement project listing/switching

### Phase 3: ChatGPT Integration (Week 2-3)

- [ ] Set up OpenAI API credentials
- [ ] Copy prompt templates from `/lib/api.ts`
- [ ] Implement background job queue (Celery/Bull)
- [ ] Create ChatGPT analysis endpoints
- [ ] Store responses in database
- [ ] Update project data_status

### Phase 4: Data Sync (Week 3)

- [ ] Implement refresh mechanism
- [ ] Add refresh counter logic
- [ ] Set up cron job for monthly reset
- [ ] Test manual refresh flow

### Phase 5: Risk Reports (Week 4)

- [ ] Implement report generation endpoint
- [ ] Store historical reports
- [ ] Test report download/export

---

## 🔐 Environment Variables

Backend needs these environment variables:

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/brandsense

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=production

# CORS (for frontend)
ALLOWED_ORIGINS=https://brandsense.vercel.app

# Rate Limiting
RATE_LIMIT_PER_HOUR=100
```

---

## 📊 Expected API Performance

- **Project Creation**: < 500ms (return immediately, process async)
- **ChatGPT Analysis**: 10-30 seconds (background job)
- **Data Retrieval**: < 200ms
- **Refresh Trigger**: < 500ms (trigger async job)

---

## 🧪 Testing Checklist

### Authentication
- [ ] Signup with corporate email works
- [ ] Signup with Gmail/Yahoo is blocked
- [ ] Signin returns valid JWT
- [ ] Session persists correctly

### Project Management
- [ ] Create project returns project ID immediately (admin only)
- [ ] List projects shows all user's projects
- [ ] Delete project removes all related data
- ~~Update project settings~~ (REMOVED - projects are immutable after creation)

### ChatGPT Integration
- [ ] Background job processes successfully
- [ ] data_status updates: pending → processing → ready
- [ ] All 4 analysis types generate valid data
- [ ] Error handling works (API failures)

### Refresh Mechanism
- [ ] Refresh counter decrements
- [ ] User can't refresh when limit reached
- [ ] Counter resets on 1st of month

---

## 📡 Frontend Integration Points

### Environment Variable (Frontend):

```bash
# .env (frontend)
VITE_API_BASE_URL=https://api.brandsense.io
```

### Frontend Code Changes (MINIMAL):

Only need to uncomment these lines in `/lib/api.ts`:

```typescript
// Line 68-73 (analyzeProject function)
const response = await fetch(`${API_BASE_URL}/projects/${project.id}/analyze`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(request),
});
return await response.json();
```

Repeat for all API functions in `/lib/api.ts`:
- `analyzeProject()` - Line 61
- `generateRiskReport()` - Line 94
- `refreshProjectData()` - Line 127
- `generateSentimentAnalysis()` - Line 137
- `generateKeywordAnalysis()` - Line 166
- `generateBrandIdentity()` - Line 195

**That's it!** No UI changes needed.

---

## 🗺️ Architecture Diagram

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────┐
│   Frontend (React/Vite)     │
│   - Authentication UI       │
│   - Onboarding Flow         │
│   - Dashboard               │
│   - localStorage (temp)     │
└──────────┬──────────────────┘
           │ HTTPS/REST
           ↓
┌─────────────────────────────┐
│   Backend API (Your Stack)  │
│   - Express/FastAPI/etc     │
│   - JWT Authentication      │
│   - Project Management      │
│   - Background Jobs         │
└──────────┬──────────────────┘
           │
           ├─────────────┬─────────────┐
           ↓             ↓             ↓
┌──────────────┐  ┌─────────┐  ┌──────────┐
│  PostgreSQL  │  │  Redis  │  │  OpenAI  │
│  /MongoDB    │  │  (Queue)│  │  API     │
└──────────────┘  └─────────┘  └──────────┘
```

---

## 🐛 Common Issues & Solutions

### Issue: ChatGPT responses are inconsistent

**Solution:** Use structured output with JSON mode in OpenAI API:

```javascript
const completion = await openai.chat.completions.create({
  model: "gpt-4-turbo-preview",
  messages: [...],
  response_format: { type: "json_object" }
});
```

### Issue: Analysis takes too long

**Solution:** 
- Use streaming for real-time updates
- Or implement webhook to notify frontend when done
- Show loading state on frontend

### Issue: Rate limiting from OpenAI

**Solution:**
- Implement exponential backoff
- Queue jobs properly
- Use caching for repeated analyses

---

## 📚 Reference Files

Frontend files to review:

- `/lib/api.ts` - API functions and prompts
- `/lib/types.ts` - TypeScript type definitions
- `/lib/storage.ts` - Storage API (will be replaced with backend calls)
- `/guidelines/Guidelines.md` - Complete architecture guide

---

## 🎯 Success Criteria

Backend is ready when:

- [ ] Frontend can authenticate users
- [ ] Users can create projects
- [ ] ChatGPT analysis completes successfully
- [ ] Dashboard displays real data (not mock data)
- [ ] Refresh mechanism works
- [ ] Risk reports generate correctly
- [ ] All data persists across sessions
- [ ] Error handling is robust

---

## 💬 Questions?

Contact frontend team with:
- API contract clarifications
- Type definition questions
- Integration issues

**We're ready when you are!** 🚀
