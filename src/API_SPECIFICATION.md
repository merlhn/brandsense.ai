# 📡 Brand Sense - API Specification

## Base URL

```
Development: http://localhost:3000/api
Production:  https://api.brandsense.io/api
```

---

## Authentication

All authenticated endpoints require JWT token in header:

```
Authorization: Bearer <jwt_token>
```

---

## Endpoints

### 1. Authentication

#### POST `/auth/signup`

Create new user account.

**Request Body:**
```json
{
  "email": "john@company.com",
  "password": "SecurePassword123",
  "fullName": "John Doe",
  "company": "Nike Inc.",
  "position": "Marketing Manager"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "user-uuid",
      "email": "john@company.com",
      "fullName": "John Doe",
      "company": "Nike Inc.",
      "position": "Marketing Manager"
    }
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Errors:**
- `400` - Corporate email required (blocked Gmail, Yahoo, etc.)
- `409` - Email already exists

---

#### POST `/auth/signin`

Sign in existing user.

**Request Body:**
```json
{
  "email": "john@company.com",
  "password": "SecurePassword123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "user-uuid",
      "email": "john@company.com",
      "fullName": "John Doe"
    }
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Errors:**
- `401` - Invalid credentials

---

#### POST `/auth/signout`

Sign out user (invalidate token).

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": null,
  "timestamp": "2025-01-15T10:30:00Z"
}
```

---

#### GET `/auth/session`

Get current user session.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "email": "john@company.com",
    "fullName": "John Doe",
    "company": "Nike Inc.",
    "position": "Marketing Manager"
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Errors:**
- `401` - Invalid or expired token

---

### 2. Projects

#### POST `/projects`

Create new project.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Nike Turkey",
  "market": "Turkey",
  "language": "Turkish",
  "timeframe": "Last 3 months",
  "aiModel": "gpt-4o",
  "industry": "Sports & Apparel",
  "websiteUrl": "https://www.nike.com.tr"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "project-uuid",
    "name": "Nike Turkey",
    "market": "Turkey",
    "language": "Turkish",
    "timeframe": "Last 3 months",
    "aiModel": "gpt-4o",
    "industry": "Sports & Apparel",
    "websiteUrl": "https://www.nike.com.tr",
    "dataStatus": "pending",
    "refreshesLeft": 15,
    "createdAt": "2025-01-15T10:30:00Z",
    "lastRefreshAt": null,
    "data": null
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Notes:**
- Returns immediately with `dataStatus: "pending"`
- Backend should trigger async ChatGPT analysis job
- Job updates `dataStatus` to `"processing"` → `"ready"` or `"error"`

---

#### GET `/projects`

List all projects for current user.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "project-uuid-1",
      "name": "Nike Turkey",
      "market": "Turkey",
      "language": "Turkish",
      "timeframe": "Last 3 months",
      "aiModel": "gpt-4o",
      "dataStatus": "ready",
      "refreshesLeft": 12,
      "createdAt": "2025-01-10T10:30:00Z",
      "lastRefreshAt": "2025-01-15T10:30:00Z"
    },
    {
      "id": "project-uuid-2",
      "name": "Adidas Germany",
      "market": "Germany",
      "language": "German",
      "timeframe": "Last 3 months",
      "aiModel": "gpt-4o",
      "dataStatus": "processing",
      "refreshesLeft": 15,
      "createdAt": "2025-01-15T09:00:00Z",
      "lastRefreshAt": null
    }
  ],
  "timestamp": "2025-01-15T10:30:00Z"
}
```

---

#### GET `/projects/:id`

Get single project with full data.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "project-uuid",
    "name": "Nike Turkey",
    "market": "Turkey",
    "language": "Turkish",
    "timeframe": "Last 3 months",
    "aiModel": "gpt-4o",
    "dataStatus": "ready",
    "refreshesLeft": 12,
    "createdAt": "2025-01-10T10:30:00Z",
    "lastRefreshAt": "2025-01-15T10:30:00Z",
    "data": {
      "brandIdentity": { /* See BrandIdentityData type */ },
      "sentimentAnalysis": { /* See SentimentAnalysisData type */ },
      "keywordAnalysis": { /* See KeywordAnalysisData type */ }
    }
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Errors:**
- `404` - Project not found
- `403` - Project belongs to another user

---

#### ~~PUT `/projects/:id`~~ (REMOVED)

**This endpoint has been removed.** Projects cannot be edited after creation. Users must delete and recreate projects if changes are needed.

---

**LEGACY DOCUMENTATION (FOR REFERENCE ONLY):**

~~Update project settings.~~

**Request Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Nike Turkey - Updated",
  "industry": "Sports & Fashion",
  "websiteUrl": "https://www.nike.com.tr"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "project-uuid",
    "name": "Nike Turkey - Updated",
    "market": "Turkey",
    "language": "Turkish",
    "timeframe": "Last 3 months",
    "aiModel": "gpt-4o",
    "industry": "Sports & Fashion",
    "websiteUrl": "https://www.nike.com.tr",
    "dataStatus": "ready",
    "refreshesLeft": 12,
    "createdAt": "2025-01-10T10:30:00Z",
    "lastRefreshAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T11:00:00Z"
  },
  "timestamp": "2025-01-15T11:00:00Z"
}
```

**Notes:**
- Cannot update: `market`, `language`, `timeframe`, `aiModel` (require refresh)
- Can update: `name`, `industry`, `websiteUrl`

---

#### DELETE `/projects/:id`

Delete project.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": null,
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Errors:**
- `404` - Project not found
- `403` - Project belongs to another user

---

#### POST `/projects/:id/refresh`

Manually refresh project data (trigger new ChatGPT analysis).

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response:** `202 Accepted`
```json
{
  "success": true,
  "data": {
    "message": "Refresh started",
    "refreshesLeft": 11,
    "estimatedCompletionTime": "30s"
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Errors:**
- `429` - No refreshes left this month
- `409` - Refresh already in progress

**Notes:**
- Decrements `refreshesLeft` counter
- Updates `dataStatus` to `"processing"`
- Triggers background ChatGPT analysis job
- User can poll `GET /projects/:id` to check status

---

### 3. ChatGPT Analysis

#### POST `/projects/:id/analyze`

**Internal endpoint** (called by background job, not frontend directly).

**Request Body:**
```json
{
  "brandName": "Nike",
  "location": "Turkey",
  "language": "Turkish",
  "timeframe": "Last 3 months",
  "aiModel": "gpt-4o",
  "analysisType": "full"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "brandIdentity": {
      "bpmData": [
        { "name": "Visibility", "score": 85, "description": "High brand recognition" },
        { "name": "Consistency", "score": 78, "description": "Coherent messaging" },
        { "name": "Emotional Resonance", "score": 82, "description": "Strong emotional connection" },
        { "name": "Distinctiveness", "score": 80, "description": "Clear differentiation" }
      ],
      "totalBPM": 81.25,
      "toneData": [
        { "trait": "Innovation", "fullName": "Innovation", "score": 88 },
        { "trait": "Trust", "fullName": "Trust / Reliability", "score": 75 },
        { "trait": "Accessibility", "fullName": "Accessibility / Mass Appeal", "score": 82 }
      ],
      "brandPowerStatement": "Nike is perceived as an innovative leader in sports...",
      "brandIdentitySummary": "Nike's identity is strongly associated with...",
      "dominantThemes": [
        { "title": "Athletic Innovation", "description": "...", "impact": "high" }
      ],
      "coreBrandPersona": "Hero",
      "keyAssociations": ["sports", "innovation", "empowerment", "quality"]
    },
    "sentimentAnalysis": {
      "overallSummary": "Nike enjoys predominantly positive sentiment...",
      "primarySentiments": [
        { "category": "Positive", "score": 72, "colorType": "success", "themes": "Quality, Innovation" },
        { "category": "Neutral", "score": 18, "colorType": "primary", "themes": "Price discussions" },
        { "category": "Negative", "score": 8, "colorType": "destructive", "themes": "Labor concerns" },
        { "category": "Mixed", "score": 2, "colorType": "foreground", "themes": "Sustainability" }
      ],
      "emotionalClusters": [
        { "name": "Excitement", "score": 85, "explanation": "Strong association with sports achievements" },
        { "name": "Trust", "score": 78, "explanation": "Long-standing reputation" }
      ],
      "sentimentProfile": [
        {
          "dimension": "Trust (Güven)",
          "score": 80,
          "trend": "up",
          "themes": "Reliability, Quality, Heritage",
          "summary": "Nike is trusted for consistent quality"
        }
      ]
    },
    "keywordAnalysis": {
      "summary": "Nike's visibility is dominated by sports-related keywords...",
      "keywords": [
        {
          "keyword": "sports",
          "visibility": 95,
          "trend": "up",
          "tone": "Positive",
          "share": 12.5,
          "explanation": "Core brand association"
        },
        {
          "keyword": "innovation",
          "visibility": 88,
          "trend": "stable",
          "tone": "Positive",
          "share": 10.2,
          "explanation": "Technology and design leadership"
        }
      ]
    }
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Process:**
1. Backend job calls ChatGPT with prompts from `/lib/api.ts`
2. Parse ChatGPT response into structured format above
3. Store in `project_data` table
4. Update project `dataStatus` to `"ready"`
5. Set `lastRefreshAt` timestamp

---

### 4. Risk Reports

#### POST `/reports/generate`

Generate brand risk report.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "projectId": "project-uuid"
}
```

**Response:** `202 Accepted`
```json
{
  "success": true,
  "data": {
    "reportId": "report-uuid",
    "status": "generating",
    "estimatedCompletionTime": "45s"
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

---

#### GET `/reports/:id`

Get generated risk report.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "report-uuid",
    "projectId": "project-uuid",
    "content": "# Nike Turkey - Brand Risk Report\n\n## Executive Summary\n\n...",
    "generatedAt": "2025-01-15T10:31:00Z"
  },
  "timestamp": "2025-01-15T10:35:00Z"
}
```

**Notes:**
- `content` is Markdown formatted
- Use prompt from `/lib/api.ts` line 228 (`getBrandRiskReportPrompt`)

---

#### GET `/reports?projectId=:projectId`

List all reports for a project.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `projectId` (required) - UUID of project

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "report-uuid-1",
      "projectId": "project-uuid",
      "generatedAt": "2025-01-15T10:30:00Z"
    },
    {
      "id": "report-uuid-2",
      "projectId": "project-uuid",
      "generatedAt": "2025-01-10T14:20:00Z"
    }
  ],
  "timestamp": "2025-01-15T10:35:00Z"
}
```

---

## Data Types Reference

### Project

```typescript
interface Project {
  id: string;
  name: string;
  market: string;
  language: string;
  timeframe: string;
  aiModel: string;
  industry?: string;
  websiteUrl?: string;
  dataStatus: 'pending' | 'processing' | 'ready' | 'error';
  refreshesLeft: number;
  createdAt: string;
  lastRefreshAt: string | null;
  updatedAt?: string;
  error?: string;
  data: ProjectData | null;
}
```

### ProjectData

```typescript
interface ProjectData {
  brandIdentity: BrandIdentityData | null;
  sentimentAnalysis: SentimentAnalysisData | null;
  keywordAnalysis: KeywordAnalysisData | null;
}
```

See `/lib/types.ts` for complete type definitions.

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "data": null,
  "error": "Error message here",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### Common Error Codes:

- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (no access to resource)
- `404` - Not Found
- `409` - Conflict (e.g., email already exists)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

---

## Rate Limiting

- **Authentication endpoints**: 10 requests / minute
- **Project endpoints**: 100 requests / minute
- **ChatGPT endpoints**: 15 requests / month (via refreshesLeft)

Response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
```

---

## WebSocket Support (Optional)

For real-time data updates:

```
ws://api.brandsense.io/ws
```

**Events:**
- `project:status-update` - When dataStatus changes
- `project:refresh-complete` - When ChatGPT analysis finishes
- `report:generated` - When risk report completes

**Example:**
```javascript
const ws = new WebSocket('wss://api.brandsense.io/ws');

ws.onmessage = (event) => {
  const { type, data } = JSON.parse(event.data);
  
  if (type === 'project:refresh-complete') {
    console.log('Project data updated:', data.projectId);
    // Reload project data
  }
};
```

---

## CORS Configuration

```javascript
// Express example
app.use(cors({
  origin: [
    'http://localhost:5173',           // Development
    'https://brandsense.vercel.app'    // Production
  ],
  credentials: true
}));
```

---

## Testing

Use these test credentials:

```
Email: test@company.com
Password: TestPassword123
```

Or use Postman collection: [Download here](#)

---

**Ready to integrate? Start with authentication endpoints!** 🚀
