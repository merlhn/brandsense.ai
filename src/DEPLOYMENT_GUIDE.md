# 🚀 Brand Sense - Complete Deployment Guide

## Overview

Brand Sense consists of **two separate deployments**:

1. **Frontend** (React SPA) → Deploy to **Vercel**
2. **Backend** (Supabase Edge Functions) → Deploy to **Supabase**

---

## 📦 Part 1: Supabase Backend Deployment

### Prerequisites
- Supabase account (https://supabase.com)
- Supabase CLI installed (`npm install -g supabase`)
- OpenAI API key

### Step 1: Link to Supabase Project
```bash
# Login to Supabase
supabase login

# Link to your project (get project ref from Supabase dashboard)
supabase link --project-ref YOUR_PROJECT_REF
```

### Step 2: Set Environment Variables in Supabase

Go to your Supabase Dashboard → Settings → Edge Functions → Secrets and add:

```env
OPENAI_API_KEY=sk-...your-openai-key
```

### Step 3: Deploy Edge Functions
```bash
# Deploy the server function
supabase functions deploy make-server-cf9a9609

# Verify deployment
supabase functions list
```

### Step 4: Get Your Supabase Credentials

From Supabase Dashboard → Settings → API:

- **Project URL**: `https://YOUR_PROJECT_ID.supabase.co`
- **Anon/Public Key**: `eyJhbGc...` (starts with eyJ)
- **Service Role Key**: `eyJhbGc...` (different from anon key)

⚠️ **Keep Service Role Key secret!** Never expose it in frontend code.

---

## 🌐 Part 2: Vercel Frontend Deployment

### Prerequisites
- Vercel account (https://vercel.com)
- GitHub repository (recommended)
- Supabase credentials from Part 1

### Option A: Deploy via GitHub (Recommended)

#### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

#### Step 2: Connect to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

#### Step 3: Add Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```env
# Supabase Configuration (from Part 1)
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key

# Optional: App Metadata
VITE_APP_NAME=Brand Sense
VITE_APP_VERSION=1.0.0
```

⚠️ **CRITICAL**: DO NOT add `SUPABASE_SERVICE_ROLE_KEY` to Vercel! It should only exist in Supabase Edge Functions.

#### Step 4: Deploy
Click "Deploy" and wait for build to complete.

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (follow prompts)
vercel

# Deploy to production
vercel --prod
```

---

## 🔧 Environment Variables Summary

### Frontend (Vercel)
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### Backend (Supabase)
```env
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co  # Auto-injected
SUPABASE_ANON_KEY=eyJhbGc...                       # Auto-injected
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...               # Auto-injected
```

---

## ✅ Post-Deployment Verification

### 1. Check Frontend
- [ ] Visit your Vercel URL (e.g., `brand-sense.vercel.app`)
- [ ] Landing page loads without errors
- [ ] Open browser console (F12) - no errors
- [ ] DevNavigator is NOT visible (production mode)
- [ ] Click "Get Started" → Sign Up form appears

### 2. Check Backend Connection
- [ ] Sign up with a test account
- [ ] Should redirect to onboarding
- [ ] Complete onboarding
- [ ] Check browser console for API responses

### 3. Test Full Flow
```
Landing Page → Sign Up → Onboarding → Create Project → Dashboard
```

### 4. Check Supabase Logs
```bash
# Stream function logs
supabase functions logs make-server-cf9a9609 --follow
```

Or in Supabase Dashboard → Edge Functions → Logs

---

## 🐛 Troubleshooting

### Frontend Issues

#### Build Fails
```bash
# Clear and rebuild locally
rm -rf node_modules dist
npm install
npm run build
```

#### Environment Variables Not Working
- Ensure they start with `VITE_` prefix
- Redeploy after adding new env vars
- Check Vercel Dashboard → Settings → Environment Variables

#### 404 on Routes
Already configured in `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Backend Issues

#### Function Not Found
```bash
# Redeploy function
supabase functions deploy make-server-cf9a9609
```

#### API Errors in Console
Check:
1. Supabase URL matches project
2. Anon key is correct (starts with `eyJ`)
3. Function is deployed (`supabase functions list`)

#### ChatGPT Quota Errors
The app has **automatic demo mode**:
- If OpenAI quota exceeded → Falls back to demo data
- Check Supabase function logs for quota errors
- Users will see "Demo Mode" indicator in dashboard

---

## 📊 Monitoring

### Vercel Analytics
Enable in Vercel Dashboard → Analytics

### Supabase Monitoring
- **Database**: Supabase Dashboard → Database → Usage
- **Auth**: Supabase Dashboard → Authentication → Users
- **Functions**: Supabase Dashboard → Edge Functions → Logs

### Error Tracking
App includes ErrorBoundary component - errors logged to console.

For production error tracking, integrate:
- Sentry (recommended)
- LogRocket
- Datadog

---

## 🔄 Updating After Initial Deploy

### Update Frontend
```bash
# Make changes
git add .
git commit -m "feat: new feature"
git push origin main

# Vercel auto-deploys on push (if GitHub integration enabled)
```

### Update Backend
```bash
# After modifying /supabase/functions/server/index.tsx
supabase functions deploy make-server-cf9a9609
```

### Update Environment Variables

**Frontend (Vercel)**:
1. Vercel Dashboard → Settings → Environment Variables
2. Add/Update variable
3. Redeploy (Settings → Deployments → Redeploy)

**Backend (Supabase)**:
```bash
# Update secret
supabase secrets set OPENAI_API_KEY=new-key

# Redeploy function to use new secret
supabase functions deploy make-server-cf9a9609
```

---

## 🔒 Security Checklist

- [x] Security headers configured (`vercel.json`)
- [x] Service role key NOT exposed to frontend
- [x] Email validation enabled (corporate emails only)
- [x] CORS configured in backend
- [x] XSS protection headers
- [ ] Rate limiting (add if needed)
- [ ] CAPTCHA on signup (add if bot issues)

---

## 📈 Performance Optimization

### Current Status
- ✅ React lazy loading (if needed)
- ✅ Code splitting
- ✅ Tailwind CSS optimized
- ✅ DevNavigator only in dev mode

### Lighthouse Targets
- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 90+
- **SEO**: 90+

---

## 🎯 Custom Domain (Optional)

### Add to Vercel
1. Vercel Dashboard → Settings → Domains
2. Add domain (e.g., `brandsense.io`)
3. Configure DNS:
   ```
   A     @       76.76.21.21
   CNAME www     cname.vercel-dns.com
   ```

### Update Environment
No code changes needed - app works on any domain.

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **OpenAI API**: https://platform.openai.com/docs

---

## ✨ Success Checklist

After deployment, verify:

- [x] Frontend live on Vercel
- [x] Backend functions deployed to Supabase
- [x] Environment variables set correctly
- [x] Landing page loads
- [x] Sign up flow works
- [x] Onboarding completes
- [x] Dashboard displays
- [x] ChatGPT analysis runs (or demo mode works)
- [x] No console errors
- [x] Mobile responsive
- [x] DevNavigator hidden in production

---

**🎉 You're live! Your Brand Sense app is now in production.**

For issues or questions, check:
1. Vercel deployment logs
2. Supabase function logs
3. Browser console (F12)
4. Network tab for API errors
