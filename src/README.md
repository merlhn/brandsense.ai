# Brand Sense

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?style=flat-square)
![Status](https://img.shields.io/badge/status-production--ready-success.svg?style=flat-square)
![License](https://img.shields.io/badge/license-proprietary-red.svg?style=flat-square)

**Monitor your brand's visibility and perception in ChatGPT.**

Brand Sense is a SaaS platform that helps modern marketers track how AI language models perceive and recommend their brands. Get real-time insights into brand sentiment, keyword visibility, and competitive positioning in the AI era.

> **🎉 Latest Release:** [v1.0.0 "Foundation"](CHANGELOG.md) - First production-ready stable release

---

## 🚀 Deploy to Production NOW

Ready to go live? Choose your deployment method:

### ⚡ Quick Start (5 minutes)
```bash
chmod +x DEPLOYMENT_COMMANDS.sh
./DEPLOYMENT_COMMANDS.sh
```

**Or choose your path:**
- 🤖 **Interactive Script** → `./DEPLOYMENT_COMMANDS.sh` - Step-by-step guidance
- ⚡ **Quick Commands** → See `DEPLOY_NOW.md` - For experienced developers
- 📋 **Full Checklist** → See `PRODUCTION_DEPLOYMENT_CHECKLIST.md` - Complete guide

**Start here:** [START_DEPLOYMENT.md](./START_DEPLOYMENT.md)

---

## 📚 Quick Links

### 🚀 Deployment
| Guide | Purpose | Time |
|-------|---------|------|
| **[START_DEPLOYMENT.md](./START_DEPLOYMENT.md)** | 🎯 Choose your deployment method (START HERE) | 2 min |
| **[DEPLOYMENT_COMMANDS.sh](./DEPLOYMENT_COMMANDS.sh)** | 🤖 Interactive deployment script (recommended) | 10 min |
| **[DEPLOY_NOW.md](./DEPLOY_NOW.md)** | ⚡ Quick deploy commands (experienced devs) | 5 min |
| **[PRODUCTION_DEPLOYMENT_CHECKLIST.md](./PRODUCTION_DEPLOYMENT_CHECKLIST.md)** | 📋 Complete deployment checklist | 15 min |
| **[QUICK_DEPLOY_VERCEL.sh](./QUICK_DEPLOY_VERCEL.sh)** | 🏃 Automated frontend deployment | 5 min |
| **[DEPLOYMENT_QUICKSTART_TR.md](./DEPLOYMENT_QUICKSTART_TR.md)** | 🇹🇷 Hızlı deployment rehberi | 5 min |

### 📖 Documentation
| Guide | Purpose | Time |
|-------|---------|------|
| **[RELEASE_v1.0.0.md](./RELEASE_v1.0.0.md)** | 🎉 Release notes and highlights | 5 min |
| **[CHANGELOG.md](./CHANGELOG.md)** | 📝 Complete version history | 10 min |
| **[CURSOR_QUICKREF.md](./CURSOR_QUICKREF.md)** | ⚡ Quick reference (shortcuts, patterns, commands) | 2 min |
| **[CURSOR_SETUP_TR.md](./CURSOR_SETUP_TR.md)** | 🇹🇷 Cursor IDE setup rehberi | 5 min |
| **[guidelines/Guidelines.md](./guidelines/Guidelines.md)** | 📖 Complete development rules | 10 min |

---

## ✨ Features

- **🎯 Brand Identity Analysis** - Understand how ChatGPT perceives your brand
- **📊 Sentiment Tracking** - Monitor positive, neutral, and negative mentions
- **🔑 Keyword Visibility** - Track which keywords trigger your brand mentions
- **⚠️ Risk Reporting** - Identify potential brand reputation risks early
- **🌍 Multi-Market Support** - Analyze brand perception across different markets and languages
- **📈 Performance Metrics** - Track visibility trends and competitor comparisons
- **🚀 Easy Onboarding** - Create your first project in under 2 minutes
- **👋 Smart User Guidance** - Clear refresh prompts and contextual banners guide you through data loading
- **♾️ Unlimited Projects** - Monitor multiple brands with one account

---

## 🚀 Tech Stack

### Frontend
- **Framework:** React 18 + TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** ShadCN UI
- **Animations:** Motion (Framer Motion)
- **Build Tool:** Vite
- **Charts:** Recharts
- **Icons:** Lucide React

### Backend
- **Platform:** Supabase (PostgreSQL + Edge Functions)
- **Runtime:** Deno (Edge Functions)
- **AI Integration:** OpenAI GPT-4 Turbo
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage (for reports)

### Deployment
- **Frontend Hosting:** Vercel
- **Backend Hosting:** Supabase Cloud
- **Database:** Supabase PostgreSQL

---

## 📦 Project Structure

```
brand-sense/
├── components/          # React components
│   ├── ui/             # ShadCN UI components
│   ├── figma/          # Protected Figma components
│   └── *.tsx           # Feature components
├── lib/                # Utilities and core logic
│   ├── api.ts          # API integration layer
│   ├── storage.ts      # Unified storage API
│   └── types.ts        # TypeScript type definitions
├── styles/             # Global styles
│   └── globals.css     # Tailwind v4 configuration
└── guidelines/         # Development documentation
    └── Guidelines.md   # Architecture and development rules
```

---

## 🛠️ Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Cursor IDE (recommended) or VS Code

### Quick Setup (Cursor IDE)

**🇹🇷 Türkçe (Recommended):**
```bash
# Otomatik setup script
chmod +x SETUP_CURSOR.sh
./SETUP_CURSOR.sh

# Development server başlat
npm run dev
```

**📚 Detaylı Cursor Rehberi:** `CURSOR_SETUP_TR.md`

### Manual Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/brand-sense.git
   cd brand-sense
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

   Required in `.env`:
   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   ```
   http://localhost:5173
   ```

---

## 🏗️ Build & Deploy

Brand Sense requires **two separate deployments**:
1. **Frontend** (React SPA) → Vercel
2. **Backend** (Supabase Edge Functions) → Supabase

### ⚡ Quick Deploy (5 Minutes)

**Türkçe (Turkish):**
```bash
# Otomatik deployment script
chmod +x QUICK_DEPLOY_VERCEL.sh
./QUICK_DEPLOY_VERCEL.sh
```

**English:**
```bash
# See detailed guide
cat DEPLOYMENT_QUICKSTART_TR.md
```

### 📚 Deployment Guides

| Guide | Language | Description | Time |
|-------|----------|-------------|------|
| **[DEPLOYMENT_QUICKSTART_TR.md](./DEPLOYMENT_QUICKSTART_TR.md)** | 🇹🇷 Türkçe | Hızlı başlangıç | 5 min |
| **[VERCEL_DEPLOYMENT_TR.md](./VERCEL_DEPLOYMENT_TR.md)** | 🇹🇷 Türkçe | Detaylı Vercel rehberi | 10 min |
| **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** | 🇬🇧 English | Complete deployment | 15 min |

### Production Build (Local Testing)

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Open http://localhost:4173
```

### Environment Variables

**Frontend (Vercel):**
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

**Backend (Supabase):**
```env
OPENAI_API_KEY=sk-proj-...
```

Get these from:
- Supabase: Dashboard → Settings → API
- OpenAI: https://platform.openai.com/api-keys

---

## 🎨 Design System

Brand Sense follows **Vercel's dark minimalism** design language:

- **Background:** `#000000` (Pure black)
- **Accent:** `#0070F3` (Vercel blue)
- **Typography:** High contrast, minimal font styling
- **Interactions:** Clean, technical aesthetic

See `styles/globals.css` for complete design tokens.

---

## 📝 Development Guidelines

### Key Principles

1. **✅ DO:** Use unified storage API (`/lib/storage.ts`)
2. **✅ DO:** Follow TypeScript types from `/lib/types.ts`
3. **✅ DO:** Accept `project: Project` prop in dashboard components
4. **❌ DON'T:** Access `localStorage` directly
5. **❌ DON'T:** Override Tailwind font classes unless needed
6. **❌ DON'T:** Modify protected files in `/components/figma/`

See `guidelines/Guidelines.md` for complete development documentation.

---

## 🔌 Backend Integration

✅ **Backend is FULLY INTEGRATED** with Supabase and OpenAI ChatGPT API.

### Features
- ✅ User authentication (sign up, sign in, logout)
- ✅ Project creation and management
- ✅ ChatGPT API integration (GPT-4 Turbo)
- ✅ Automatic demo mode fallback (if quota exceeded)
- ✅ Real-time data refresh
- ✅ Risk report generation
- ✅ Supabase PostgreSQL database

### 📚 Backend Documentation

**Recommended: Supabase** (Fastest implementation - ~1 week)
- **[SUPABASE_INTEGRATION.md](SUPABASE_INTEGRATION.md)** - ⭐ **START HERE!** Complete Supabase guide (~30 min setup)

**Alternative: Custom Backend** (Traditional approach - ~2-3 weeks)
- **[BACKEND_REQUIREMENTS.md](BACKEND_REQUIREMENTS.md)** - Complete integration guide
- **[API_SPECIFICATION.md](API_SPECIFICATION.md)** - Detailed API documentation
- **[BACKEND_QUICKSTART.md](BACKEND_QUICKSTART.md)** - Get started in < 1 day

**Critical for Both:**
- **[CHATGPT_RESPONSE_PARSING.md](CHATGPT_RESPONSE_PARSING.md)** - ⚠️ **MUST READ:** How to parse ChatGPT responses
- **[database/schema.sql](database/schema.sql)** - PostgreSQL schema

### API Integration Points

- **`/lib/api.ts`** - Replace mock functions with real API calls
- **Storage Layer** - Already handles API responses via unified storage API
- **ChatGPT Integration** - Prompt templates and request formats ready

### When Backend is Ready

1. Update `VITE_API_BASE_URL` in `.env`
2. Replace mock functions in `/lib/api.ts`
3. Implement ChatGPT API integration
4. Store responses using `storage.updateProjectData()`

All dashboard components will automatically consume real data with zero breaking changes.

---

## 🔒 Security

- **Input Validation:** All forms validated client-side and server-side
- **Error Boundaries:** Global error handling prevents crashes
- **Environment Variables:** Sensitive data stored in `.env` (never committed)
- **Authentication:** Supabase Auth with JWT tokens
- **Authorization:** Row-level security in PostgreSQL

---

## 🚦 Current Status

- ✅ Authentication flow complete (Supabase Auth)
- ✅ Dashboard layouts complete (admin-managed projects only)
- ✅ Users cannot create projects (contact admin)
- ✅ Backend integration complete (Supabase + Edge Functions)
- ✅ ChatGPT API integration complete (GPT-4o)
- ✅ Unified storage API implemented
- ✅ Type system complete
- ✅ Production-ready deployment

---

## 📊 Product Constraints

### AI Model Options
- **Active:** GPT-4o (default)
- **Coming Soon:** Claude, Gemini

### Report Timeframe Options
- **Active:** Last 3 months (default)
- **Coming Soon:** Last 6 months, Last year

---

## 📄 License

**Proprietary** - All rights reserved

---

## 👥 Support

For questions, issues, or feature requests:

- **Email:** support@brandsense.io
- **Documentation:** See `guidelines/Guidelines.md`

---

**Built with ❤️ for modern marketers navigating the AI era.**
