#!/bin/bash

# Brand Sense - Create Release Tag Script
# Bu script yeni bir release tag'i oluşturur

set -e

# Renk kodları
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🎉 Brand Sense - Create Release"
echo "================================"
echo ""

# VERSION.txt dosyasından bilgileri oku
if [ ! -f VERSION.txt ]; then
    echo -e "${RED}✗ VERSION.txt dosyası bulunamadı!${NC}"
    exit 1
fi

VERSION=$(sed -n '1p' VERSION.txt)
CODENAME=$(sed -n '2p' VERSION.txt)
DATE=$(sed -n '3p' VERSION.txt)

echo -e "${BLUE}Version:${NC} $VERSION"
echo -e "${BLUE}Codename:${NC} $CODENAME"
echo -e "${BLUE}Date:${NC} $DATE"
echo ""

# Git kontrolü
if [ ! -d .git ]; then
    echo -e "${RED}✗ Git repository bulunamadı!${NC}"
    echo "Önce 'git init' komutunu çalıştırın."
    exit 1
fi

# Uncommitted changes kontrolü
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    echo -e "${YELLOW}⚠ Uncommitted changes var!${NC}"
    echo ""
    read -p "Devam etmek istiyor musunuz? (y/N): " confirm
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        echo "İptal edildi."
        exit 0
    fi
fi

echo ""
echo -e "${BLUE}Release tag oluşturuluyor...${NC}"

# Git tag oluştur
TAG_NAME="v${VERSION}"
TAG_MESSAGE="Brand Sense ${VERSION} \"${CODENAME}\"

First production-ready stable release.

See CHANGELOG.md for full release notes.
"

git tag -a "$TAG_NAME" -m "$TAG_MESSAGE"

echo -e "${GREEN}✓ Tag oluşturuldu: $TAG_NAME${NC}"
echo ""

echo -e "${YELLOW}Tag'i GitHub'a push etmek için:${NC}"
echo "  git push origin $TAG_NAME"
echo ""
echo -e "${YELLOW}Tüm tag'leri push etmek için:${NC}"
echo "  git push --tags"
echo ""

read -p "Şimdi push etmek istiyor musunuz? (y/N): " push_confirm
if [[ $push_confirm =~ ^[Yy]$ ]]; then
    # Remote var mı kontrol et
    if git remote get-url origin &> /dev/null; then
        echo ""
        echo -e "${BLUE}GitHub'a push ediliyor...${NC}"
        git push origin "$TAG_NAME"
        echo -e "${GREEN}✓ Tag push edildi!${NC}"
        echo ""
        echo -e "${GREEN}GitHub'da release oluşturmak için:${NC}"
        echo "  https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/releases/new?tag=$TAG_NAME"
    else
        echo -e "${RED}✗ Git remote 'origin' bulunamadı!${NC}"
        echo "Önce GitHub repository'sini ekleyin:"
        echo "  git remote add origin https://github.com/KULLANICI_ADI/brand-sense.git"
    fi
else
    echo ""
    echo -e "${YELLOW}Tag oluşturuldu ama push edilmedi.${NC}"
    echo "Daha sonra push etmek için:"
    echo "  git push origin $TAG_NAME"
fi

echo ""
echo -e "${GREEN}================================"
echo "🎉 Release hazır!"
echo -e "================================${NC}"
echo ""
echo "Next steps:"
echo "1. GitHub'da release notes ekleyin (CHANGELOG.md'den kopyalayın)"
echo "2. Production'a deploy edin (DEPLOYMENT_GUIDE.md)"
echo "3. Release announcement yapın"
echo ""
