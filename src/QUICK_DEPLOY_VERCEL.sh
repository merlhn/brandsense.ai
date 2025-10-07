#!/bin/bash

# Brand Sense - Quick Vercel Deployment Script
# Bu script deployment sürecini otomatikleştirir

set -e  # Hata durumunda dur

echo "🚀 Brand Sense - Vercel Deployment Script"
echo "=========================================="
echo ""

# Renk kodları
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Git kontrolü
echo -e "${BLUE}[1/6] Git repository kontrolü...${NC}"
if [ ! -d .git ]; then
    echo -e "${YELLOW}Git repository bulunamadı. Başlatılıyor...${NC}"
    git init
    echo -e "${GREEN}✓ Git repository başlatıldı${NC}"
else
    echo -e "${GREEN}✓ Git repository mevcut${NC}"
fi
echo ""

# 2. Dependencies kontrolü
echo -e "${BLUE}[2/6] Dependencies kontrolü...${NC}"
if [ ! -d node_modules ]; then
    echo -e "${YELLOW}node_modules bulunamadı. Yükleniyor...${NC}"
    npm install
    echo -e "${GREEN}✓ Dependencies yüklendi${NC}"
else
    echo -e "${GREEN}✓ Dependencies mevcut${NC}"
fi
echo ""

# 3. Build test
echo -e "${BLUE}[3/6] Production build test...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build başarılı${NC}"
else
    echo -e "${RED}✗ Build başarısız! Lütfen hataları düzeltin.${NC}"
    exit 1
fi
echo ""

# 4. Git commit
echo -e "${BLUE}[4/6] Git commit...${NC}"
git add .
read -p "Commit mesajı (Enter = varsayılan): " commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="Production ready - Brand Sense deployment"
fi
git commit -m "$commit_msg" || echo "Değişiklik yok veya zaten commit edilmiş"
echo -e "${GREEN}✓ Commit tamamlandı${NC}"
echo ""

# 5. GitHub push kontrolü
echo -e "${BLUE}[5/6] GitHub repository kontrolü...${NC}"
if ! git remote get-url origin &> /dev/null; then
    echo -e "${YELLOW}GitHub remote bulunamadı.${NC}"
    echo ""
    echo -e "${YELLOW}Lütfen şu adımları takip edin:${NC}"
    echo "1. GitHub'da yeni repository oluştur: https://github.com/new"
    echo "2. Repository adı: brand-sense"
    echo "3. Visibility: Private (önerilen)"
    echo "4. Aşağıdaki komutu çalıştır:"
    echo ""
    read -p "GitHub kullanıcı adınız: " github_user
    echo ""
    echo -e "${BLUE}Şu komutu çalıştırın:${NC}"
    echo -e "${GREEN}git remote add origin https://github.com/$github_user/brand-sense.git${NC}"
    echo -e "${GREEN}git branch -M main${NC}"
    echo -e "${GREEN}git push -u origin main${NC}"
    echo ""
    echo -e "${YELLOW}Sonra bu scripti tekrar çalıştırın.${NC}"
    exit 0
else
    echo -e "${GREEN}✓ GitHub remote mevcut${NC}"
    echo ""
    echo -e "${BLUE}GitHub'a push ediliyor...${NC}"
    git push origin main
    echo -e "${GREEN}✓ GitHub'a push edildi${NC}"
fi
echo ""

# 6. Vercel bilgilendirme
echo -e "${BLUE}[6/6] Vercel Deployment${NC}"
echo ""
echo -e "${GREEN}✓ Kod GitHub'da hazır!${NC}"
echo ""
echo -e "${YELLOW}Şimdi Vercel'e deploy etmek için:${NC}"
echo ""
echo "1️⃣  Vercel'e git: https://vercel.com/new"
echo ""
echo "2️⃣  GitHub repository'sini import et:"
echo "    - Repository: brand-sense"
echo ""
echo "3️⃣  Framework Preset: Vite (otomatik algılanır)"
echo ""
echo "4️⃣  Environment Variables ekle:"
echo ""
echo "    VITE_SUPABASE_URL=https://xxxxx.supabase.co"
echo "    VITE_SUPABASE_ANON_KEY=eyJhbGciOiJI..."
echo ""
echo "    Bu bilgileri nereden alacaksın:"
echo "    → Supabase Dashboard: https://supabase.com/dashboard"
echo "    → Settings → API"
echo ""
echo "5️⃣  Deploy butonuna bas!"
echo ""
echo -e "${GREEN}=========================================="
echo "🎉 Frontend hazır! Şimdi Vercel'e deploy et."
echo -e "==========================================${NC}"
echo ""
echo -e "${YELLOW}Backend için:${NC}"
echo ""
echo "Supabase Edge Functions deploy etmek için:"
echo ""
echo "  cd $(pwd)"
echo "  supabase login"
echo "  supabase link --project-ref YOUR_PROJECT_REF"
echo "  supabase functions deploy make-server-cf9a9609"
echo "  supabase secrets set OPENAI_API_KEY=sk-proj-xxxxx"
echo ""
echo -e "${BLUE}Detaylı rehber: VERCEL_DEPLOYMENT_TR.md${NC}"
echo ""
