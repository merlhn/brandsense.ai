#!/bin/bash

# Brand Sense v1.0.0 "Foundation" - Deployment Commands
# Copy and paste these commands to deploy to production

echo "🚀 Brand Sense v1.0.0 'Foundation' - Production Deployment"
echo "============================================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ============================================================
# PART 1: BACKEND DEPLOYMENT (SUPABASE)
# ============================================================

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}PART 1: BACKEND DEPLOYMENT (SUPABASE)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}Step 1.1: Create Supabase Project${NC}"
echo "1. Go to: https://supabase.com/dashboard"
echo "2. Click: 'New Project'"
echo "3. Fill in:"
echo "   - Name: brand-sense"
echo "   - Database Password: [GENERATE & SAVE]"
echo "   - Region: Europe West (Frankfurt)"
echo "4. Click: 'Create new project'"
echo "5. Wait 1-2 minutes..."
echo ""
read -p "Press Enter when project is created..."
echo ""

echo -e "${YELLOW}Step 1.2: Get Supabase Credentials${NC}"
echo "1. Go to: Project Settings → API"
echo "2. Copy these values:"
echo ""
echo "   Project URL: _______________________________________"
echo "   anon public: _______________________________________"
echo "   service_role: ______________________________________"
echo ""
read -p "Press Enter when you have the credentials..."
echo ""

echo -e "${YELLOW}Step 1.3: Install Supabase CLI${NC}"
echo "Running: npm install -g supabase"
echo ""
npm install -g supabase
echo ""

echo -e "${YELLOW}Step 1.4: Login to Supabase${NC}"
echo "Running: supabase login"
echo ""
supabase login
echo ""

echo -e "${YELLOW}Step 1.5: Link Project${NC}"
echo "Get your Project Ref from: Project Settings → General"
echo ""
read -p "Enter your Project Ref: " project_ref
echo ""
supabase link --project-ref $project_ref
echo ""

echo -e "${YELLOW}Step 1.6: Deploy Database Schema${NC}"
echo ""
echo -e "${RED}⚠️  IMPORTANT: Manual step required!${NC}"
echo ""
echo "1. Go to: Supabase Dashboard → SQL Editor"
echo "2. Click: 'New Query'"
echo "3. Open local file: database/supabase_schema.sql"
echo "4. Copy entire content and paste into SQL Editor"
echo "5. Click: 'Run'"
echo ""
echo "File location: $(pwd)/database/supabase_schema.sql"
echo ""
read -p "Press Enter when schema is deployed..."
echo ""

echo -e "${YELLOW}Step 1.7: Deploy Edge Function${NC}"
echo "Running: supabase functions deploy make-server-cf9a9609"
echo ""
supabase functions deploy make-server-cf9a9609
echo ""

echo -e "${YELLOW}Step 1.8: Set OpenAI API Key${NC}"
echo ""
read -p "Enter your OpenAI API key (sk-proj-...): " openai_key
echo ""
supabase secrets set OPENAI_API_KEY=$openai_key
echo ""

echo -e "${YELLOW}Step 1.9: Test Backend${NC}"
echo "Running health check..."
echo ""
health_url="https://$project_ref.supabase.co/functions/v1/make-server-cf9a9609/health"
echo "URL: $health_url"
echo ""
curl $health_url
echo ""
echo ""
echo -e "${GREEN}✓ Backend deployment complete!${NC}"
echo ""
read -p "Press Enter to continue to frontend deployment..."
echo ""

# ============================================================
# PART 2: FRONTEND DEPLOYMENT (VERCEL)
# ============================================================

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}PART 2: FRONTEND DEPLOYMENT (VERCEL)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}Step 2.1: Test Build Locally${NC}"
echo "Running: npm run build"
echo ""
npm run build
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo ""
    echo -e "${RED}✗ Build failed! Please fix errors before continuing.${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}Step 2.2: Commit to Git${NC}"
echo ""
git add .
echo ""
read -p "Enter commit message (or press Enter for default): " commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="Release v1.0.0 'Foundation' - Production deployment"
fi
echo ""
git commit -m "$commit_msg"
echo ""

echo -e "${YELLOW}Step 2.3: Push to GitHub${NC}"
echo ""
if ! git remote get-url origin &> /dev/null; then
    echo -e "${YELLOW}GitHub remote not found. Setting up...${NC}"
    echo ""
    echo "1. Create repository at: https://github.com/new"
    echo "   - Name: brand-sense"
    echo "   - Visibility: Private (recommended)"
    echo ""
    read -p "Enter your GitHub username: " github_user
    echo ""
    git remote add origin https://github.com/$github_user/brand-sense.git
    git branch -M main
    echo ""
fi

echo "Pushing to GitHub..."
echo ""
git push origin main
echo ""
echo -e "${GREEN}✓ Code pushed to GitHub${NC}"
echo ""

echo -e "${YELLOW}Step 2.4: Deploy to Vercel${NC}"
echo ""
echo "Now deploy to Vercel:"
echo ""
echo "1. Go to: https://vercel.com/new"
echo ""
echo "2. Import Repository:"
echo "   - Find: brand-sense"
echo "   - Click: Import"
echo ""
echo "3. Framework: Vite (auto-detected)"
echo ""
echo "4. Environment Variables (IMPORTANT!):"
echo ""
echo "   Name: VITE_SUPABASE_URL"
echo "   Value: https://$project_ref.supabase.co"
echo ""
echo "   Name: VITE_SUPABASE_ANON_KEY"
echo "   Value: [paste your anon public key from Step 1.2]"
echo ""
echo "5. Click: Deploy"
echo ""
echo "6. Wait 2-3 minutes..."
echo ""
read -p "Press Enter when Vercel deployment is complete..."
echo ""

# ============================================================
# PART 3: VERIFICATION
# ============================================================

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}PART 3: VERIFICATION${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

read -p "Enter your Vercel production URL (https://...vercel.app): " vercel_url
echo ""

echo -e "${YELLOW}Testing deployment...${NC}"
echo ""
echo "1. Opening production URL in browser..."
echo "   URL: $vercel_url"
echo ""
echo "2. Manual tests:"
echo "   [ ] Landing page loads"
echo "   [ ] Click 'Get Started'"
echo "   [ ] Sign up with email"
echo "   [ ] Create project"
echo "   [ ] Dashboard loads"
echo "   [ ] No console errors (F12)"
echo ""
echo "3. Open browser console (F12) and check for errors"
echo ""
read -p "Press Enter if all tests pass..."
echo ""

# ============================================================
# DEPLOYMENT COMPLETE
# ============================================================

echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETE!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${GREEN}✓ Backend deployed to Supabase${NC}"
echo -e "${GREEN}✓ Frontend deployed to Vercel${NC}"
echo -e "${GREEN}✓ Database schema created${NC}"
echo -e "${GREEN}✓ Environment variables configured${NC}"
echo ""

echo "📝 Important URLs:"
echo ""
echo "   Production App:  $vercel_url"
echo "   Vercel Dashboard: https://vercel.com/dashboard"
echo "   Supabase Dashboard: https://supabase.com/dashboard/project/$project_ref"
echo ""

echo "🔐 Save these credentials:"
echo ""
echo "   Supabase URL: https://$project_ref.supabase.co"
echo "   Supabase Anon Key: [from Step 1.2]"
echo "   OpenAI API Key: $openai_key"
echo ""

echo "📋 Next Steps:"
echo ""
echo "   1. Monitor logs:"
echo "      vercel logs"
echo "      supabase functions logs make-server-cf9a9609"
echo ""
echo "   2. Test with real users"
echo ""
echo "   3. Set up custom domain (optional):"
echo "      Vercel Dashboard → Settings → Domains"
echo ""
echo "   4. Enable analytics:"
echo "      Vercel Dashboard → Analytics"
echo ""

echo "📚 Documentation:"
echo ""
echo "   - Complete checklist: PRODUCTION_DEPLOYMENT_CHECKLIST.md"
echo "   - Deployment guide (TR): VERCEL_DEPLOYMENT_TR.md"
echo "   - Deployment guide (EN): DEPLOYMENT_GUIDE.md"
echo "   - API reference: API_SPECIFICATION.md"
echo ""

echo -e "${GREEN}Happy deploying! 🚀${NC}"
echo ""
