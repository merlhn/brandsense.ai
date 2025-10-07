# Brand Sense - Development Guidelines

**Version:** 1.0.0 "Foundation" | **Status:** Production Ready | **Last Updated:** 2025-01-08

## Overview

Brand Sense is a ChatGPT-based brand visibility monitoring SaaS product with Supabase backend integration.

### Design System
- **Theme**: Vercel dark minimalism
- **Background**: `#000000`
- **Accent**: `#0070F3` (Vercel blue)
- **Typography**: High contrast, minimal styling overrides
- **Style**: Technical aesthetic with clean interactions

---

## Architecture

### Technology Stack
- **Frontend**: React + TypeScript + Tailwind CSS v4
- **Backend**: Supabase (Edge Functions + PostgreSQL + Auth)
- **AI**: OpenAI GPT-4o
- **Storage**: LocalStorage (frontend) + Supabase (backend)

### Data Flow
1. User creates project → Frontend collects data
2. Frontend → Backend API (Supabase Edge Functions)
3. Backend → OpenAI GPT-4o API
4. Backend → Parses response → Stores in Supabase
5. Frontend → Fetches structured data → Displays dashboard

---

## Storage Architecture

### Unified Storage API (`/lib/storage.ts`)

All frontend data operations use the unified storage API. Never access `localStorage` directly.

#### ✅ Correct Usage:
```typescript
import { storage } from '../lib/storage';

// Load projects
const projects = storage.getAllProjects();

// Save project
storage.saveProject(project);

// Delete project
storage.deleteProject(projectId);

// Get current project
const currentProject = storage.getCurrentProject();
```

#### ❌ Incorrect Usage:
```typescript
// DON'T DO THIS
localStorage.getItem('dashboard_projects');
localStorage.setItem('dashboard_projects', JSON.stringify(projects));
```

### Storage Keys (from `/lib/types.ts`)
```typescript
STORAGE_KEYS = {
  PROJECTS: 'dashboard_projects',
  SELECTED_PROJECT_ID: 'dashboard_selectedProjectId',
  USER_PROFILE: 'user_profile',
}
```

---

## Component Structure

### Dashboard Components Pattern

All dashboard components follow this pattern:

```typescript
interface ComponentProps {
  project: Project;
}

export function Component({ project }: ComponentProps) {
  // 1. Get data from storage
  const storedData = storage.getProjectData(project.id);
  const data = storedData?.specificData;
  
  // 2. Fallback to placeholder if no data
  const displayData = data || placeholderData;
  
  // 3. Render
  return <div>...</div>;
}
```

### Type Definitions

#### Project Type
```typescript
interface Project {
  id: string;                    // UUID
  name: string;                  // Brand Name
  market: string;                // Market (e.g., "Turkey")
  language: string;              // Language (e.g., "Turkish")
  timeframe: string;             // Timeframe (e.g., "Last 3 months")
  aiModel: string;               // AI Model (e.g., "gpt-4o")
  industry?: string;
  websiteUrl?: string;
  createdAt: string;
  lastRefreshAt: string | null;
  dataStatus: 'pending' | 'processing' | 'ready' | 'error';
  data: ProjectData | null;      // ChatGPT structured data
  error?: string;
}
```

---

## Backend Integration

### API Endpoints (Supabase Edge Functions)

Base URL: `https://<project-id>.supabase.co/functions/v1/make-server-cf9a9609/`

#### Authentication
All requests require:
```typescript
Authorization: Bearer <access_token>
```

#### Key Endpoints
- `POST /auth/signup` - Create new user account
- `POST /auth/signin` - User login (handled by Supabase Auth)
- `POST /projects/create` - Create new project (authenticated users)
- `GET /projects` - Get all user projects
- `GET /projects/:id` - Get project with full data
- `DELETE /projects/:id` - **Hard delete** project (permanent deletion from database)
- `POST /projects/refresh` - Refresh project data

**Note:** Project editing (PUT /projects/:id) has been disabled. Projects cannot be modified after creation - users must delete and recreate if changes are needed.

### ChatGPT Integration

Dashboard components expect structured data from ChatGPT:

- `BrandIdentity.tsx` → Expects `BrandIdentityData` (see `/lib/types.ts`)
- `SentimentAnalysis.tsx` → Expects `SentimentAnalysisData`
- `KeywordAnalysis.tsx` → Expects `KeywordAnalysisData`

**⚠️ CRITICAL:** Backend must parse ChatGPT responses into exact JSON structure before storing. See `CHATGPT_RESPONSE_PARSING.md` for details.

---

## Authentication Flow

### Sign Up & Onboarding
1. User submits: Full Name, Email, Password
2. Backend creates user with `email_confirm: true` (no email verification)
3. Backend auto-signs in user
4. Frontend receives access_token
5. **Redirect to Create Project screen (onboarding)**
6. User enters brand information:
   - Brand Name (required)
   - Market (required, dropdown)
   - Language (required, dropdown)
   - Industry (optional)
   - Website URL (optional)
   - Description (optional)
7. Backend creates project and starts ChatGPT analysis in background
8. Redirect to Dashboard (shows placeholder data immediately)
9. Analysis completes in 2-3 minutes → Dashboard automatically updates with real ChatGPT data

### Sign In
- User submits: Email, Password
- Supabase Auth validates credentials
- Frontend receives access_token
- Redirect to dashboard (loads existing projects)

### Access Token Storage
```typescript
// Save token
storage.setAccessToken(token);

// Get token
const token = storage.getAccessToken();

// Clear token (logout)
storage.clearAccessToken();
```

---

## Project Structure

```
/components
  /ui/              → ShadCN components
  *.tsx             → Feature components

/lib
  api.ts            → Backend API integration
  storage.ts        → Unified storage API
  types.ts          → TypeScript types

/styles
  globals.css       → Tailwind v4 config

/supabase/functions/server
  index.tsx         → Supabase Edge Function (API routes)
  kv_store.tsx      → Database utilities
```

---

## Development Rules

### ✅ DO:
- Use unified storage API for all frontend data operations
- Accept `project: Project` prop in dashboard components
- Provide fallback/placeholder data when data unavailable
- Use TypeScript types from `/lib/types.ts`
- Follow Vercel dark minimalism design system
- Handle all dataStatus states: pending → processing → ready/error

### ❌ DON'T:
- Access `localStorage` directly
- Create new storage keys without updating `STORAGE_KEYS`
- Override Tailwind font classes unless explicitly needed
- Modify protected files in `/components/figma/`
- Hardcode any brand data

---

## User Flow

### New User Journey
1. **Landing Page** → Sign Up
2. **Sign Up** → Create account (email, password, full name)
3. **Create Project** → Onboarding screen (brand name, market, language, etc.)
4. **Dashboard** → View brand analysis (placeholder data → real data auto-loads in 2-3 minutes)

### Existing User Journey
1. **Landing Page** → Sign In
2. **Dashboard** → View existing projects
3. **Create New Project** → Add additional brands (if needed)

---

## Product Constraints

### AI Model Selection
- **Active**: GPT-4o (default)
- **Coming Soon**: Claude, Gemini
- Only GPT-4o can be selected currently

### Report Timeframe
- **Active**: Last 3 months (default)
- **Coming Soon**: Last 6 months, Last year
- Only "Last 3 months" can be selected currently

### Data Refresh
- Unlimited refreshes available
- No monthly limit or counter
- Suggest refresh if data > 7 days old

---

## Environment Variables

### Frontend
```bash
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

### Backend (Supabase Edge Function)
```bash
SUPABASE_URL=<your-supabase-url>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
OPENAI_API_KEY=<your-openai-api-key>
```

---

## Current Status

✅ Complete Features:
- Authentication (Sign Up, Sign In, Session Management)
- Onboarding flow with project creation
- **NEW: Complete onboarding UX with refresh guidance**
  - Welcome toasts at every step
  - Onboarding banner in dashboard
  - Pulse indicator on refresh button
  - Auto-dismiss on data ready
  - Clear user guidance for data loading
- Dashboard layouts
- All dashboard components
- User-managed project creation (create projects after sign up)
- Unified storage API
- Backend integration (Supabase + ChatGPT)
- Type system
- Error boundaries
- Production-ready deployment

🔄 Coming Soon:
- Claude & Gemini AI models
- Extended timeframe options (6 months, 1 year)
- Advanced analytics features
- Push notifications when data ready

---

## Deployment

### Production Checklist
- ✅ Environment variables configured
- ✅ Supabase project created
- ✅ Database schema deployed
- ✅ Edge functions deployed
- ✅ OpenAI API key configured
- ✅ Frontend build tested
- ✅ Error handling verified

### Build Commands
```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

---

## Important Files

### Documentation
- `README.md` - Main project documentation
- `DEPLOYMENT_GUIDE.md` - Deployment instructions
- `QUICK_DEPLOY.sh` - Deployment script
- `API_SPECIFICATION.md` - API endpoint reference
- `BACKEND_REQUIREMENTS.md` - Backend architecture
- `BACKEND_QUICKSTART.md` - Backend setup guide
- `CHATGPT_RESPONSE_PARSING.md` - Critical data parsing guide
- `SUPABASE_INTEGRATION.md` - Supabase setup
- `ONBOARDING_UX_GUIDE.md` - UX patterns and user guidance
- `Attributions.md` - Credits and licenses
- `guidelines/Guidelines.md` - This file (development standards)

### Protected Files (Never Modify)
- `/components/figma/ImageWithFallback.tsx`
- `/supabase/functions/server/kv_store.tsx`
- `/utils/supabase/info.tsx`

---

## Notes

- All UUIDs generated with `crypto.randomUUID()` for Supabase compatibility
- Frontend storage is temporary - backend is source of truth
- All ChatGPT responses must be parsed to structured JSON before storing
- Error boundaries catch and display all runtime errors
- No dev mode tools in production build
