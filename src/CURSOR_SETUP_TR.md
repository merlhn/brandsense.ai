# 🎯 Brand Sense - Cursor IDE Setup Rehberi

## Projeyi Cursor'a Taşıma (5 Dakika)

### Adım 1: Projeyi İndir

Figma Make'den projeyi indirmek için:

1. **Figma Make workspace'inde** bu dosyayı görüyorsan, sağ üst köşedeki **"Export"** veya **"Download"** butonunu kullan
2. Proje bir **ZIP dosyası** olarak indirilecek
3. ZIP'i masaüstüne veya tercih ettiğin bir klasöre çıkar

**Alternatif:** Eğer proje GitHub'da ise:
```bash
git clone https://github.com/KULLANICI_ADI/brand-sense.git
cd brand-sense
```

---

### Adım 2: Cursor'da Aç

1. **Cursor**'u başlat (https://cursor.sh)
2. **File → Open Folder** (veya `Cmd/Ctrl + O`)
3. İndirdiğin `brand-sense` klasörünü seç
4. **Select Folder** → Proje açılacak

---

### Adım 3: Dependencies Yükle

Cursor'un Terminal'ini aç (`Ctrl + ~` veya View → Terminal):

```bash
# Node.js versiyonunu kontrol et (minimum 18.x gerekli)
node --version

# npm versiyonunu kontrol et
npm --version

# Dependencies'i yükle
npm install
```

**⏱️ Süre:** 2-3 dakika (internet hızına bağlı)

**Sorun mu var?**
```bash
# Cache temizle ve tekrar dene
rm -rf node_modules package-lock.json
npm install
```

---

### Adım 4: Environment Variables Ayarla

#### Option A: `.env` Dosyası Oluştur (Önerilen)

Proje klasöründe `.env` dosyası oluştur:

```bash
# Terminal'de:
touch .env
```

`.env` dosyasını aç ve şunu ekle:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: Development flags
VITE_DEV_MODE=true
```

**Değerleri nereden alacaksın:**
1. https://supabase.com/dashboard
2. Projenizi seç
3. **Settings** → **API**
4. `Project URL` → `VITE_SUPABASE_URL`
5. `anon` `public` key → `VITE_SUPABASE_ANON_KEY`

#### Option B: `.env.example` Kopyala

```bash
cp .env.example .env
# Sonra .env dosyasını düzenle
```

---

### Adım 5: Development Server Başlat

```bash
npm run dev
```

**Başarılı çıktı:**
```
VITE v5.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

Tarayıcıda aç: **http://localhost:5173**

✅ Landing page görünmelisin!

---

## 🤖 Cursor AI ile Çalışma

### 1. Cursor AI'a Projeyi Tanıt

Cursor'da `Cmd/Ctrl + L` tuşuna bas (AI Chat):

```
Bu Brand Sense adında bir SaaS projesi. ChatGPT'de marka görünürlüğünü 
izleyen bir platform. Guidelines.md dosyasını oku ve proje hakkında bilgi edin.
```

Cursor AI otomatik olarak şu dosyaları okuyacak:
- `guidelines/Guidelines.md` → Proje kuralları
- `README.md` → Genel bilgi
- `DEPLOYMENT_GUIDE.md` → Deployment

### 2. AI Composer Kullan

**Yeni Feature Eklemek için:**

1. `Cmd/Ctrl + K` → AI Composer aç
2. Şunu yaz:
   ```
   Dashboard'a yeni bir "Export to PDF" butonu ekle. 
   BrandRiskReporter component'inde olacak.
   Guidelines.md'deki design system'i takip et.
   ```

3. AI öneri yapacak → **Accept** veya **Reject**

### 3. Inline Düzenleme

Kod satırında `Cmd/Ctrl + K`:

```typescript
// Bu kodu seç:
const [loading, setLoading] = useState(false);

// Cmd/Ctrl + K → AI'a sor:
"Bu state'i bir custom hook'a taşı"
```

### 4. Chat ile Debugging

`Cmd/Ctrl + L` (Chat):

```
CreateProject.tsx'de form submit olmuyor. 
Console'da şu hata var: [hatayı yapıştır]
Ne yapmalıyım?
```

---

## 📁 Cursor'da Proje Yapısı

### Önemli Dosyalar (AI'a göster)

Cursor AI'a hangi dosyaların önemli olduğunu söyle:

```
@guidelines/Guidelines.md 'i oku. Bu dosya tüm proje kurallarını içeriyor.

Key dosyalar:
- @lib/storage.ts - Unified storage API
- @lib/types.ts - TypeScript tipleri
- @lib/api.ts - Backend integration
- @components/DashboardLayout.tsx - Main dashboard
- @supabase/functions/server/index.tsx - Backend API
```

### Workspace Settings (Opsiyonel)

`.vscode/settings.json` oluştur:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

---

## 🛠️ Cursor Shortcuts (Önemli)

| Shortcut | Açıklama |
|----------|----------|
| `Cmd/Ctrl + K` | AI Composer (inline edit) |
| `Cmd/Ctrl + L` | AI Chat |
| `Cmd/Ctrl + I` | AI açıklama iste |
| `Cmd/Ctrl + Shift + L` | AI ile tüm dosyayı düzenle |
| `Cmd/Ctrl + ~` | Terminal aç/kapat |
| `Cmd/Ctrl + P` | Dosya ara |
| `Cmd/Ctrl + Shift + F` | Projede ara |

---

## 🔧 Development Workflow

### 1. Feature Geliştirme

```bash
# 1. Yeni branch oluştur (opsiyonel)
git checkout -b feature/export-pdf

# 2. Development server başlat
npm run dev

# 3. Cursor AI ile kod yaz
# Cmd/Ctrl + K veya Cmd/Ctrl + L

# 4. Değişiklikleri test et
# Tarayıcıda http://localhost:5173

# 5. Build test et
npm run build

# 6. Commit et
git add .
git commit -m "feat: add PDF export"
```

### 2. Component Oluşturma

Cursor Chat'e (`Cmd/Ctrl + L`):

```
Yeni bir component oluştur: ExportToPDF.tsx

Requirements:
- Dashboard'dan erişilebilir olacak
- Project data'sını PDF olarak export edecek
- Guidelines.md'deki design system'i kullan
- Tailwind classes: bg-background, text-foreground, accent: #0070F3
```

### 3. Bug Fix

```
CreateProject.tsx'de brand name validation çalışmıyor.
30+ karakter validation'ı implement et.
@lib/types.ts 'deki BRAND_NAME_VALIDATION kurallarını kullan.
```

---

## 🎨 Tailwind IntelliSense

### Kurulum

1. Cursor Extensions → **Tailwind CSS IntelliSense** yükle
2. Settings'de aktif et

### Kullanım

```tsx
<div className="bg-  // Autocomplete çalışacak
```

**Custom Colors:**
```tsx
<div className="bg-primary text-primary-foreground">
  // bg-primary → #0070F3
  // text-primary-foreground → #FFFFFF
</div>
```

---

## 🐛 Debugging Cursor'da

### 1. Console Logs

```typescript
console.log('[CreateProject] Form submitted:', formData);
```

Terminal'de görünecek + Browser Console'da.

### 2. TypeScript Errors

Cursor'un **Problems** paneli:
- `Cmd/Ctrl + Shift + M` → Tüm TypeScript errors

AI'a sor:
```
@CreateProject.tsx 'de TypeScript error var.
"Property 'name' does not exist on type 'Project'"
Nasıl düzeltebilirim?
```

### 3. React DevTools

Browser'da:
- F12 → React DevTools
- Component tree'yi incele

---

## 📦 Backend Development (Supabase)

### Local Edge Functions Test

```bash
# Supabase CLI yükle
npm install -g supabase

# Supabase projesine bağlan
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# Edge function'ı local'de test et
supabase functions serve make-server-cf9a9609

# Başka terminal'de:
curl http://localhost:54321/functions/v1/make-server-cf9a9609/health
```

### Backend Kodu Düzenle

1. `/supabase/functions/server/index.tsx` dosyasını aç
2. Cursor AI'a sor:
   ```
   @supabase/functions/server/index.tsx
   
   /projects/create endpoint'ine yeni bir validation ekle:
   - Brand name minimum 3 karakter olmalı
   ```

3. Deploy et:
   ```bash
   supabase functions deploy make-server-cf9a9609
   ```

---

## 🚀 Production Build Test

```bash
# Build yap
npm run build

# Build çıktısını test et
npm run preview

# Tarayıcıda http://localhost:4173
```

**Build errors varsa:**
```bash
# TypeScript errors'ı göster
npm run build 2>&1 | grep "error TS"
```

Cursor AI'a yapıştır:
```
Build error alıyorum:
[error log buraya]

Nasıl düzeltebilirim?
```

---

## 🔒 Environment Variables Güvenliği

### `.gitignore` Kontrol Et

`.env` dosyası `.gitignore`'da olmalı:

```gitignore
# Environment variables
.env
.env.local
.env.production
```

### API Keys

⚠️ **ASLA commit etme:**
- `VITE_SUPABASE_ANON_KEY` → Frontend'de kullanılabilir (public)
- `SUPABASE_SERVICE_ROLE_KEY` → **SADECE backend'de!** (GİZLİ)
- `OPENAI_API_KEY` → **SADECE backend'de!** (GİZLİ)

---

## 📚 Cursor AI Best Practices

### 1. Context Sağla

❌ **Kötü:**
```
Bir button ekle.
```

✅ **İyi:**
```
@CreateProject.tsx dosyasına form'un altına bir "Cancel" butonu ekle.
@guidelines/Guidelines.md 'deki button styling'i kullan.
onClick={() => onNavigate('landing')}
```

### 2. Dosya Referansları

```
@filename.tsx 'i kullan - Cursor otomatik okuyor
```

### 3. Guidelines Referansı

Her önemli request'te ekle:
```
@guidelines/Guidelines.md 'deki design system'i takip et.
```

---

## ✅ Cursor Setup Checklist

Kurulumdan sonra kontrol et:

- [ ] `npm install` başarılı
- [ ] `.env` dosyası oluşturuldu ve dolduruldu
- [ ] `npm run dev` çalışıyor
- [ ] `http://localhost:5173` açılıyor
- [ ] Landing page görünüyor
- [ ] Console'da error yok (F12)
- [ ] Cursor AI çalışıyor (`Cmd/Ctrl + L`)
- [ ] Tailwind IntelliSense aktif
- [ ] TypeScript errors yok (`Cmd/Ctrl + Shift + M`)
- [ ] `.gitignore` `.env` dosyasını içeriyor

---

## 🎯 İlk Task (Cursor AI ile)

Cursor AI'a şunu yaz (`Cmd/Ctrl + L`):

```
Merhaba! Brand Sense projesine hoş geldin.

Lütfen şu dosyaları oku:
- @guidelines/Guidelines.md
- @README.md

Proje hakkında kısa bir özet ver ve hangi stack kullanıldığını söyle.
```

Cursor AI sana projeyi özetleyecek. Böylece setup'ın doğru olduğunu anlarsın.

---

## 🐛 Common Issues

### 1. "npm install" Hatası

```bash
# Node version kontrol et (18+ gerekli)
node --version

# npm cache temizle
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 2. "VITE_SUPABASE_URL is not defined"

`.env` dosyası yok veya yanlış. Tekrar oluştur:
```bash
touch .env
# Supabase credentials'ları ekle
```

### 3. Cursor AI Çalışmıyor

- Cursor'u restart et
- Internet bağlantısını kontrol et
- Cursor Settings → AI → API Key kontrol et

### 4. Port 5173 Kullanımda

```bash
# Farklı port kullan
npm run dev -- --port 3000
```

---

## 📞 Yardım

**Cursor Documentation:**
- https://cursor.sh/docs

**Brand Sense Docs:**
- `guidelines/Guidelines.md` - Proje kuralları
- `DEPLOYMENT_GUIDE.md` - Deployment
- `API_SPECIFICATION.md` - API endpoints

**Cursor AI'a Sor:**
```
@guidelines/Guidelines.md dosyasını oku.
[Sorununu buraya yaz]
```

---

## 🎉 Başarı!

Artık Cursor'da Brand Sense üzerinde çalışabilirsin!

**Next Steps:**
1. Cursor AI ile tanış (`Cmd/Ctrl + L`)
2. Bir test feature ekle
3. Local'de test et (`npm run dev`)
4. Production build test et (`npm run build`)
5. Vercel'e deploy et (DEPLOYMENT_GUIDE.md)

**Happy Coding! 🚀**
