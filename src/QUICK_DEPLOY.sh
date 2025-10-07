#!/bin/bash

# 🚀 Brand Sense - Quick Deploy Script
# Bu script deployment dosyalarını hazırlar

set -e

echo "╔════════════════════════════════════════════════════════╗"
echo "║   🚀 Brand Sense Backend Deployment                   ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Create directory
echo -e "${BLUE}📁 Step 1: Creating directory structure...${NC}"
mkdir -p supabase/functions/make-server-cf9a9609
echo -e "${GREEN}✓ Directory created${NC}"
echo ""

# Step 2: Instructions
echo -e "${YELLOW}📋 Step 2: Copy backend files${NC}"
echo ""
echo "Lütfen şu adımları izleyin:"
echo ""
echo "1️⃣  Figma Make'te şu dosyayı açın:"
echo "   ${BLUE}/supabase/functions/server/kv_store.tsx${NC}"
echo ""
echo "2️⃣  Tüm içeriği kopyalayın (Cmd+A, Cmd+C)"
echo ""
echo "3️⃣  Şu dosyaya yapıştırın:"
echo "   ${GREEN}$(pwd)/supabase/functions/make-server-cf9a9609/kv_store.ts${NC}"
echo ""
echo "   Terminal komutu:"
echo "   ${BLUE}nano supabase/functions/make-server-cf9a9609/kv_store.ts${NC}"
echo "   (Yapıştır: Cmd+V, Kaydet: Ctrl+O, Enter, Çıkış: Ctrl+X)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "4️⃣  Figma Make'te şu dosyayı açın:"
echo "   ${BLUE}/supabase/functions/server/index.tsx${NC}"
echo ""
echo "5️⃣  Tüm içeriği kopyalayın (Cmd+A, Cmd+C)"
echo ""
echo "6️⃣  Şu dosyaya yapıştırın:"
echo "   ${GREEN}$(pwd)/supabase/functions/make-server-cf9a9609/index.ts${NC}"
echo ""
echo "   Terminal komutu:"
echo "   ${BLUE}nano supabase/functions/make-server-cf9a9609/index.ts${NC}"
echo "   (Yapıştır: Cmd+V)"
echo ""
echo "7️⃣  ${RED}ÖNEMLİ:${NC} Satır 5'i bulup değiştirin:"
echo "   ${RED}ÖNCE:${NC} import * as kv from \"./kv_store.tsx\";"
echo "   ${GREEN}SONRA:${NC} import * as kv from \"./kv_store.ts\";"
echo ""
echo "   (Kaydet: Ctrl+O, Enter, Çıkış: Ctrl+X)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "Dosyaları kopyaladınız mı? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo -e "${YELLOW}⚠️  Dosyaları kopyaladıktan sonra tekrar çalıştırın${NC}"
    exit 1
fi

# Step 3: Verify files
echo ""
echo -e "${BLUE}🔍 Step 3: Dosyaları kontrol ediyorum...${NC}"

if [ ! -f "supabase/functions/make-server-cf9a9609/kv_store.ts" ]; then
    echo -e "${RED}❌ kv_store.ts dosyası bulunamadı!${NC}"
    exit 1
fi

if [ ! -f "supabase/functions/make-server-cf9a9609/index.ts" ]; then
    echo -e "${RED}❌ index.ts dosyası bulunamadı!${NC}"
    exit 1
fi

# Check import statement
if grep -q 'kv_store.tsx' supabase/functions/make-server-cf9a9609/index.ts; then
    echo -e "${RED}❌ UYARI: index.ts'de hala '.tsx' import var!${NC}"
    echo -e "${YELLOW}   Satır 5'i '.ts' olarak değiştirin${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Dosyalar doğru${NC}"
echo ""

# Step 4: Deploy
echo -e "${BLUE}🚀 Step 4: Supabase'e deploy ediyorum...${NC}"
echo ""

supabase functions deploy make-server-cf9a9609 --project-ref vtnglubfoyvfwuxxbugs

# Step 5: Test
echo ""
echo -e "${BLUE}🧪 Step 5: Health check testi...${NC}"
echo ""

sleep 2

RESPONSE=$(curl -s https://vtnglubfoyvfwuxxbugs.supabase.co/functions/v1/make-server-cf9a9609/health)

echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║   ✅ DEPLOYMENT TAMAMLANDI!                           ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Backend URL:${NC}"
echo "https://vtnglubfoyvfwuxxbugs.supabase.co/functions/v1/make-server-cf9a9609"
echo ""
echo -e "${BLUE}Şimdi ne yapmalısınız?${NC}"
echo "1. Uygulamayı test edin (Sign Up)"
echo "2. Yeni bir proje oluşturun"
echo "3. Dashboard'da dataların yüklendiğini görün"
echo ""
echo -e "${YELLOW}Tebrikler! Brand Sense artık tam çalışıyor! 🎉${NC}"
