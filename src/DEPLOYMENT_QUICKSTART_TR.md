# ⚡ Brand Sense - Hızlı Deployment (Türkçe)

## 🎯 5 Dakikada Deploy Et

### Hazırlık (2 Dakika)

1. **Hesap Oluştur** (henüz yoksa):
   - GitHub: https://github.com/signup
   - Vercel: https://vercel.com/signup (GitHub ile giriş yap)
   - Supabase: https://supabase.com (GitHub ile giriş yap)
   - OpenAI: https://platform.openai.com/signup

2. **Supabase Projesi Oluştur**:
   - https://supabase.com/dashboard
   - "New Project" → Proje adı: `brand-sense`
   - Region: Europe West (Frankfurt) - Türkiye'ye yakın
   - Database Password: Güçlü bir şifre (kaydet!)
   - "Create new project" (1-2 dakika sürer)

3. **OpenAI API Key Al**:
   - https://platform.openai.com/api-keys
   - "Create new secret key" → Adı: `Brand Sense`
   - Key'i kopyala (bir daha göremezsin!)
   - Billing: https://platform.openai.com/account/billing
   - $5-10 yükle (ilk ay için yeterli)

---

### Otomatik Deployment (3 Dakika)

#### Option 1: Otomatik Script (Mac/Linux)

```bash
# Terminal'de proje klasörüne git
cd /path/to/brand-sense

# Script'i çalıştırılabilir yap
chmod +x QUICK_DEPLOY_VERCEL.sh

# Deployment başlat
./QUICK_DEPLOY_VERCEL.sh
```

Script seni yönlendirecek! 🚀

#### Option 2: Manuel Deployment

**Adım 1: GitHub'a Yükle**

```bash
cd /path/to/brand-sense
git init
git add .
git commit -m "Production ready"

# GitHub'da repo oluştur: https://github.com/new
# Sonra:
git remote add origin https://github.com/KULLANICI_ADI/brand-sense.git
git branch -M main
git push -u origin main
```

**Adım 2: Vercel'e Deploy**

1. https://vercel.com/new
2. Repository seç: `brand-sense`
3. Environment Variables:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJI...
   ```
   *(Supabase Dashboard → Settings → API'den al)*
4. **Deploy** bas

**Adım 3: Backend Deploy**

```bash
# Supabase CLI yükle
npm install -g supabase

# Giriş yap
supabase login

# Projeyi bağla (Supabase Dashboard → Settings → General → Reference ID)
supabase link --project-ref YOUR_PROJECT_REF

# Functions deploy et
supabase functions deploy make-server-cf9a9609

# OpenAI key ayarla
supabase secrets set OPENAI_API_KEY=sk-proj-xxxxx
```

---

## ✅ Test Et

### 1. Frontend Test

Vercel'den aldığın URL'i aç:
```
https://brand-sense-xxxx.vercel.app
```

✓ Landing page görünmeli  
✓ Console'da (F12) hata olmamalı

### 2. Backend Test

1. Sign Up yap
2. Onboarding'i tamamla
3. Dashboard'a git
4. Console'da başarılı API calls görmeli

### 3. ChatGPT Test

1. Dashboard'da placeholder data görünecek
2. 2-3 dakika bekle
3. Refresh et (F5)
4. Real data yüklenmeli

---

## 🐛 Sorun mu var?

### Build Hatası
```bash
rm -rf node_modules dist
npm install
npm run build
```

### Backend Connection Hatası
1. Vercel → Environment Variables kontrol et
2. Supabase → Edge Functions → Logs kontrol et
3. Browser Console (F12) kontrol et

### OpenAI Hatası
1. OpenAI Dashboard → Bakiye kontrol et
2. API key doğru mu?
3. Supabase secrets doğru ayarlandı mı?

---

## 📚 Detaylı Rehberler

- **Türkçe**: `VERCEL_DEPLOYMENT_TR.md`
- **English**: `DEPLOYMENT_GUIDE.md`
- **Backend**: `BACKEND_QUICKSTART.md`

---

## 🎉 Başarı!

Frontend URL: `https://brand-sense-xxxx.vercel.app`

**Next Steps:**
- [ ] Custom domain ekle (opsiyonel)
- [ ] Test kullanıcılarla dene
- [ ] Analytics ekle (Vercel Analytics)
- [ ] Feedback topla

---

## 📞 Yardıma mı ihtiyacın var?

**Logs Kontrol:**
```bash
# Frontend (Vercel)
Vercel Dashboard → Deployments → View Logs

# Backend (Supabase)
supabase functions logs make-server-cf9a9609 --follow

# Browser
F12 → Console
```

**Common Issues:**
- Environment variables → Vercel redeploy et
- Backend errors → Supabase logs oku
- Build fails → `npm run build` local'de test et

**Dokümanlar:**
- Vercel: https://vercel.com/docs
- Supabase: https://supabase.com/docs
