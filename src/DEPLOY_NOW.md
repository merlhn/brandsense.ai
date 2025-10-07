# 🚀 Deploy Brand Sense NOW - Quick Commands

**For experienced developers who want to deploy ASAP.**

---

## ⚡ 5-Minute Deploy

### Prerequisites
- [ ] GitHub account
- [ ] Vercel account (free)
- [ ] Supabase account (free)
- [ ] OpenAI API key

---

## Part 1: Backend (2 minutes)

```bash
# 1. Create Supabase project
# Go to: https://supabase.com/dashboard
# Click: New Project → brand-sense → Create

# 2. Get credentials (Project Settings → API)
export SUPABASE_URL="https://xxxxx.supabase.co"
export SUPABASE_ANON_KEY="eyJhbGciOi..."
export SUPABASE_SERVICE_KEY="eyJhbGciOi..."

# 3. Install Supabase CLI
npm install -g supabase

# 4. Login and link
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# 5. Deploy database
# Copy content from database/supabase_schema.sql
# Paste in: Supabase Dashboard → SQL Editor → Run

# 6. Deploy Edge Function
supabase functions deploy make-server-cf9a9609

# 7. Set secrets
supabase secrets set OPENAI_API_KEY=sk-proj-xxxxx

# 8. Test
curl https://YOUR_PROJECT_REF.supabase.co/functions/v1/make-server-cf9a9609/health
# Should return: {"status":"ok",...}
```

✅ Backend deployed!

---

## Part 2: Frontend (3 minutes)

```bash
# 1. Build locally (test)
npm install
npm run build
# Should complete without errors

# 2. Push to GitHub
git init
git add .
git commit -m "Release v1.0.0 - Production ready"

# Create repo at: https://github.com/new
# Name: brand-sense

git remote add origin https://github.com/YOUR_USERNAME/brand-sense.git
git branch -M main
git push -u origin main

# 3. Deploy to Vercel
# Go to: https://vercel.com/new
# Import: brand-sense repository
# Add environment variables:
#   VITE_SUPABASE_URL = https://xxxxx.supabase.co
#   VITE_SUPABASE_ANON_KEY = eyJhbGciOi...
# Click: Deploy

# Wait 2-3 minutes...
```

✅ Frontend deployed!

---

## Part 3: Verify (30 seconds)

```bash
# Open production URL
# https://brand-sense-xxxxx.vercel.app

# Test:
# 1. Click "Get Started"
# 2. Sign up with email
# 3. Create project
# 4. Check dashboard loads

# Open browser console (F12)
# Should have NO red errors
```

✅ Deployment complete!

---

## 🎉 You're Live!

**Production URL:** `https://brand-sense-xxxxx.vercel.app`

**Next steps:**
1. Monitor logs: `vercel logs` & `supabase functions logs`
2. Test with real users
3. Set up custom domain (optional)
4. Enable analytics

---

## 🐛 Quick Fixes

### Build fails:
```bash
npm run build  # Test locally
# Fix errors, commit, push again
```

### Backend 502:
```bash
supabase functions logs make-server-cf9a9609
# Check for errors, redeploy if needed
```

### CORS error:
```bash
# Edit /supabase/functions/server/index.tsx
# Add your domain to cors() origins
supabase functions deploy make-server-cf9a9609
```

### Env vars not working:
```bash
# Vercel Dashboard → Settings → Environment Variables
# Make sure they start with VITE_
# Redeploy: Deployments → ... → Redeploy
```

---

**For detailed guide:** See `PRODUCTION_DEPLOYMENT_CHECKLIST.md`

**Happy deploying! 🚀**
