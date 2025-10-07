# 🚀 Brand Sense - Vercel Deployment Rehberi (Türkçe)

## 📋 Gereksinimler

Deployment öncesi hazır olması gerekenler:

- ✅ GitHub hesabı
- ✅ Vercel hesabı (ücretsiz)
- ✅ Supabase projesi (ücretsiz)
- ✅ OpenAI API key (ücretli, yaklaşık $5-10/ay)

---

## 🎯 Hızlı Deployment (5 Dakika)

### 1️⃣ GitHub'a Yükle

```bash
# Terminal'i aç ve proje klasörüne git
cd /path/to/brand-sense

# Git repository başlat
git init
git add .
git commit -m "Production ready - Brand Sense v1.0"

# GitHub'da yeni repository oluştur (web arayüzünden):
# https://github.com/new
# Repository adı: brand-sense
# Visibility: Private (önerilen)
# Diğer ayarlar: Değiştirme

# Repository'yi local'e bağla (YOUR_USERNAME yerine GitHub kullanıcı adını yaz)
git remote add origin https://github.com/YOUR_USERNAME/brand-sense.git
git branch -M main
git push -u origin main
```

### 2️⃣ Vercel'e Deploy Et

1. **Vercel'e git**: https://vercel.com/new
2. **GitHub repository'sini seç**: `brand-sense`
3. **Configure Project** ekranında:
   - **Framework Preset**: `Vite` (otomatik algılanır)
   - **Root Directory**: `.` (değiştirme)
   - **Build Command**: `npm run build` (otomatik)
   - **Output Directory**: `dist` (otomatik)

4. **Environment Variables** ekle (aşağıya tıkla):

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Bu bilgileri nereden alacaksın?**
- Supabase Dashboard → https://supabase.com/dashboard
- Projenizi seçin
- **Settings** → **API** bölümüne git
- `Project URL` → `VITE_SUPABASE_URL`
- `Project API keys` → `anon` `public` key → `VITE_SUPABASE_ANON_KEY`

5. **Deploy** butonuna bas

✅ **İlk deployment 2-3 dakika sürer**

---

## 🔧 Supabase Backend Setup

Frontend deploy olduktan sonra backend'i ayarlayalım:

### 1️⃣ Supabase CLI Yükle

```bash
# Terminal'de:
npm install -g supabase
```

### 2️⃣ Supabase'e Giriş Yap

```bash
supabase login
```

Browser açılacak, Supabase'e giriş yap.

### 3️⃣ Projeyi Bağla

```bash
# Supabase Dashboard'dan Project Ref'i al:
# https://supabase.com/dashboard → Your Project → Settings → General → Reference ID

supabase link --project-ref YOUR_PROJECT_REF
```

### 4️⃣ Edge Functions Deploy Et

```bash
# Server function'ı deploy et
supabase functions deploy make-server-cf9a9609

# Başarılı deploy mesajı görmelisin
```

### 5️⃣ Environment Variables Ayarla

**Option A: Supabase Dashboard (Kolay)**

1. https://supabase.com/dashboard
2. Projenizi seçin
3. **Edge Functions** → **make-server-cf9a9609** → **Settings**
4. **Secrets** bölümüne ekle:

```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
```

**Option B: CLI (Hızlı)**

```bash
supabase secrets set OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
```

✅ **Backend hazır!**

---

## ✅ Test Et

### 1️⃣ Frontend Test

Vercel deployment tamamlandıktan sonra size bir URL verecek:
```
https://brand-sense-xxxx.vercel.app
```

Bu URL'i tarayıcıda aç:

- ✅ Landing page görünmeli
- ✅ "Get Started" butonu çalışmalı
- ✅ Console'da (F12) hata olmamalı

### 2️⃣ Backend Test

Sign Up işlemi yap:

1. **Get Started** → **Sign Up**
2. Email, password, full name gir
3. **Create Account** bas
4. Onboarding ekranına yönlendirmeli
5. Brand bilgilerini doldur
6. **Create Project** bas
7. Dashboard'a gitmeli

**Console'da (F12) şunları kontrol et:**
- ✅ `POST /auth/signup` → 200 OK
- ✅ `POST /projects/create` → 200 OK
- ✅ Hiç 500 hatası olmamalı

### 3️⃣ ChatGPT Integration Test

Dashboard'da:

1. Placeholder data görünecek (Nike Türkiye örneği)
2. 2-3 dakika bekle
3. Sayfa refresh et (F5)
4. Real ChatGPT data yüklenmeli

**Eğer yüklenmediyse:**

```bash
# Supabase logs kontrol et
supabase functions logs make-server-cf9a9609 --follow
```

Logs'da OpenAI API errors varsa kontrol et:
- OpenAI API key doğru mu?
- OpenAI hesabında bakiye var mı?

---

## 🐛 Sorun Giderme

### Frontend Deploy Hatası

**Hata**: Build failed

**Çözüm**:
```bash
# Local'de test et
rm -rf node_modules dist
npm install
npm run build

# Eğer local'de çalışıyorsa, Vercel'e tekrar deploy et:
git add .
git commit -m "Fix build"
git push origin main
```

### Backend Connection Hatası

**Hata**: Console'da `Failed to fetch` veya `500 Internal Server Error`

**Çözüm**:

1. **Supabase URL doğru mu?**
   ```bash
   # Vercel Dashboard → Settings → Environment Variables
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   ```

2. **Anon key doğru mu?**
   ```bash
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJI...
   ```

3. **Edge Function deploy edildi mi?**
   ```bash
   supabase functions list
   # make-server-cf9a9609 listede görünmeli
   ```

4. **Environment variables değiştirdiysen, Vercel'de redeploy et:**
   - Vercel Dashboard → Settings → Deployments
   - En son deployment → ... → Redeploy

### OpenAI Quota Hatası

**Hata**: Supabase logs'da `insufficient_quota`

**Çözüm**:
1. OpenAI Dashboard → https://platform.openai.com/account/billing
2. Bakiye ekle ($5-10 yeterli)
3. Birkaç dakika bekle (quota güncellemesi)
4. Tekrar dene

**Geçici çözüm**: App otomatik olarak demo mode'a geçecek (placeholder data gösterir)

---

## 🔄 Güncellemeler

### Frontend Güncelle

```bash
# Kod değişikliği yap
git add .
git commit -m "feat: yeni özellik"
git push origin main

# Vercel otomatik deploy eder (GitHub integration varsa)
```

### Backend Güncelle

```bash
# /supabase/functions/server/index.tsx dosyasını düzenle
# Sonra:
supabase functions deploy make-server-cf9a9609
```

---

## 🌐 Custom Domain Ekleme (Opsiyonel)

1. **Domain satın al** (örn: GoDaddy, Namecheap)
2. **Vercel'e ekle**:
   - Vercel Dashboard → Settings → Domains
   - Add domain: `brandsense.io`
3. **DNS ayarları**:
   ```
   Type    Name    Value
   A       @       76.76.21.21
   CNAME   www     cname.vercel-dns.com
   ```
4. **Propagation bekle** (24-48 saat)

---

## 📊 Production Checklist

Deployment sonrası kontrol listesi:

- [ ] Frontend Vercel'de live
- [ ] Backend Supabase'de deploy edildi
- [ ] Environment variables ayarlandı
- [ ] Sign up çalışıyor
- [ ] Sign in çalışıyor
- [ ] Onboarding tamamlanıyor
- [ ] Dashboard görünüyor
- [ ] ChatGPT analysis çalışıyor (veya demo mode aktif)
- [ ] Console'da hata yok
- [ ] Mobile responsive
- [ ] HTTPS aktif (Vercel otomatik)

---

## 🎉 Başarı!

Uygulamanız artık production'da! 

**Vercel URL'iniz:**
```
https://brand-sense-xxxx.vercel.app
```

**Next Steps:**
1. Test kullanıcılarla dene
2. Feedback topla
3. Gerekirse güncelle
4. Custom domain ekle (opsiyonel)

---

## 📞 Yardım

**Sorun mu yaşıyorsun?**

1. **Vercel Logs**: Vercel Dashboard → Deployments → View Function Logs
2. **Supabase Logs**: `supabase functions logs make-server-cf9a9609`
3. **Browser Console**: F12 → Console tab
4. **Network Tab**: F12 → Network → Filter: XHR

**Dokümanlar:**
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- `DEPLOYMENT_GUIDE.md` (İngilizce detaylı rehber)
