#!/bin/bash

# Brand Sense - Cursor First Time Setup Script
# Bu script Cursor'da ilk kurulumu otomatikleştirir

set -e  # Hata durumunda dur

echo "🎯 Brand Sense - Cursor Setup"
echo "============================="
echo ""

# Renk kodları
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Node.js kontrolü
echo -e "${BLUE}[1/5] Node.js versiyonu kontrol ediliyor...${NC}"
node_version=$(node --version 2>/dev/null || echo "none")
if [ "$node_version" = "none" ]; then
    echo -e "${RED}✗ Node.js bulunamadı!${NC}"
    echo ""
    echo "Node.js yüklemek için:"
    echo "  Mac: brew install node"
    echo "  Windows: https://nodejs.org/en/download/"
    echo "  Linux: sudo apt install nodejs npm"
    exit 1
fi

# Version check (minimum 18.x)
node_major=$(echo $node_version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$node_major" -lt 18 ]; then
    echo -e "${YELLOW}⚠ Node.js versiyon $node_version çok eski (minimum 18.x gerekli)${NC}"
    echo "Güncellemek için: https://nodejs.org"
else
    echo -e "${GREEN}✓ Node.js $node_version${NC}"
fi
echo ""

# 2. Dependencies kontrolü
echo -e "${BLUE}[2/5] Dependencies yükleniyor...${NC}"
if [ ! -d node_modules ]; then
    echo -e "${YELLOW}node_modules bulunamadı. npm install çalıştırılıyor...${NC}"
    npm install
    echo -e "${GREEN}✓ Dependencies yüklendi${NC}"
else
    echo -e "${YELLOW}node_modules mevcut. Güncelleme yapılıyor...${NC}"
    npm install
    echo -e "${GREEN}✓ Dependencies güncellendi${NC}"
fi
echo ""

# 3. Environment variables kontrolü
echo -e "${BLUE}[3/5] Environment variables kontrol ediliyor...${NC}"
if [ ! -f .env ]; then
    echo -e "${YELLOW}.env dosyası bulunamadı. Oluşturuluyor...${NC}"
    
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ .env dosyası .env.example'dan oluşturuldu${NC}"
    else
        cat > .env << 'EOF'
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJI...

# Optional: Development
VITE_DEV_MODE=true
EOF
        echo -e "${GREEN}✓ .env dosyası oluşturuldu${NC}"
    fi
    
    echo ""
    echo -e "${YELLOW}⚠ ÖNEMLİ: .env dosyasını düzenle ve Supabase credentials'ları ekle!${NC}"
    echo ""
    echo "Şu değerleri doldur:"
    echo "  1. https://supabase.com/dashboard 'a git"
    echo "  2. Projenizi seçin"
    echo "  3. Settings → API"
    echo "  4. VITE_SUPABASE_URL = Project URL"
    echo "  5. VITE_SUPABASE_ANON_KEY = anon/public key"
    echo ""
    read -p "Enter tuşuna bas (devam etmek için)..."
else
    echo -e "${GREEN}✓ .env dosyası mevcut${NC}"
    
    # Validate env vars
    if grep -q "xxxxx.supabase.co" .env; then
        echo -e "${YELLOW}⚠ .env dosyasında placeholder değerler var!${NC}"
        echo "Lütfen gerçek Supabase credentials'larını ekle."
        echo ""
    fi
fi
echo ""

# 4. Build test
echo -e "${BLUE}[4/5] Production build test ediliyor...${NC}"
echo -e "${YELLOW}Bu 10-30 saniye sürebilir...${NC}"
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build başarılı${NC}"
    rm -rf dist  # Cleanup
else
    echo -e "${RED}✗ Build başarısız!${NC}"
    echo ""
    echo "Build hatalarını görmek için:"
    echo "  npm run build"
    echo ""
    echo "Devam ediliyor (development için sorun değil)..."
fi
echo ""

# 5. Git kontrolü
echo -e "${BLUE}[5/5] Git repository kontrol ediliyor...${NC}"
if [ ! -d .git ]; then
    echo -e "${YELLOW}Git repository bulunamadı. Başlatılıyor...${NC}"
    git init
    echo -e "${GREEN}✓ Git repository başlatıldı${NC}"
else
    echo -e "${GREEN}✓ Git repository mevcut${NC}"
fi

# .gitignore kontrolü
if ! grep -q "^\.env$" .gitignore 2>/dev/null; then
    echo -e "${YELLOW}⚠ .env dosyası .gitignore'da değil. Ekleniyor...${NC}"
    echo ".env" >> .gitignore
    echo -e "${GREEN}✓ .env .gitignore'a eklendi${NC}"
fi
echo ""

# Özet
echo -e "${GREEN}========================================="
echo "✅ Setup Tamamlandı!"
echo -e "=========================================${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo ""
echo "1️⃣  .env dosyasını düzenle (eğer henüz yapmadıysan):"
echo "    open .env  # Mac"
echo "    code .env  # VS Code/Cursor"
echo ""
echo "2️⃣  Development server başlat:"
echo "    npm run dev"
echo ""
echo "3️⃣  Tarayıcıda aç:"
echo "    http://localhost:5173"
echo ""
echo "4️⃣  Cursor AI'a projeyi tanıt (Cmd/Ctrl + L):"
echo '    "Merhaba! @guidelines/Guidelines.md dosyasını oku"'
echo ""
echo -e "${YELLOW}📚 Detaylı rehber:${NC}"
echo "    - CURSOR_SETUP_TR.md (Türkçe Cursor rehberi)"
echo "    - DEPLOYMENT_GUIDE.md (Production deployment)"
echo "    - guidelines/Guidelines.md (Proje kuralları)"
echo ""
echo -e "${GREEN}Happy Coding! 🚀${NC}"
echo ""
