# ⚡ Brand Sense - Cursor Quick Reference

## 🚀 İlk Kurulum (2 Dakika)

```bash
# 1. Dependencies yükle
npm install

# 2. Environment variables
cp .env.example .env
# .env dosyasını düzenle (Supabase credentials)

# 3. Development başlat
npm run dev

# 4. Browser aç
open http://localhost:5173
```

---

## ⌨️ Cursor Shortcuts

| Shortcut | Açıklama |
|----------|----------|
| `⌘/Ctrl + K` | AI Composer (inline edit) |
| `⌘/Ctrl + L` | AI Chat |
| `⌘/Ctrl + I` | AI açıklama |
| `⌘/Ctrl + Shift + L` | Tüm dosyayı AI ile düzenle |
| `⌘/Ctrl + ~` | Terminal aç/kapat |
| `⌘/Ctrl + P` | Dosya ara |
| `⌘/Ctrl + Shift + F` | Projede ara |
| `⌘/Ctrl + Shift + M` | Problems panel |

---

## 🤖 Cursor AI Komutları

### Projeyi Tanıt
```
Merhaba! @guidelines/Guidelines.md dosyasını oku.
Bu proje hakkında bilgi edin.
```

### Component Oluştur
```
Yeni component: ExportPDF.tsx
- Dashboard'dan erişilebilir
- Project data'sını PDF export eder
- @guidelines/Guidelines.md design system kullan
```

### Bug Fix
```
@CreateProject.tsx 'de form validation çalışmıyor.
Brand name 30+ karakter validation ekle.
@lib/types.ts kurallarını kullan.
```

### Code Review
```
@components/DashboardLayout.tsx 'i review et.
@guidelines/Guidelines.md 'ye uygun mu?
Performance iyileştirme önerileri ver.
```

---

## 📁 Önemli Dosyalar

| Dosya | Açıklama |
|-------|----------|
| `guidelines/Guidelines.md` | ⭐ **Proje kuralları** (her şey burada) |
| `lib/storage.ts` | Unified storage API |
| `lib/types.ts` | TypeScript tipleri |
| `lib/api.ts` | Backend integration |
| `components/DashboardLayout.tsx` | Main dashboard |
| `supabase/functions/server/index.tsx` | Backend API |
| `styles/globals.css` | Design system |

---

## 🎨 Design System (Kopyala-Yapıştır)

### Colors
```tsx
<div className="bg-background text-foreground">       {/* #000000, #EDEDED */}
<div className="bg-primary text-primary-foreground">  {/* #0070F3, #FFFFFF */}
<div className="bg-card text-card-foreground">        {/* #0A0A0A, #EDEDED */}
<div className="border-border">                        {/* #333333 */}
```

### Typography
```tsx
<h1>Title</h1>           {/* text-2xl font-medium */}
<p>Paragraph</p>         {/* text-base font-normal */}
<button>Button</button>  {/* text-base font-medium */}
```

### Components
```tsx
import { Button } from "./components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./components/ui/card";

<Button>Click me</Button>
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

---

## 💾 Storage API (Kopyala-Yapıştır)

```typescript
import { storage } from '../lib/storage';

// Get current project
const project = storage.getCurrentProject();

// Get all projects
const projects = storage.getAllProjects();

// Save project
storage.saveProject(project);

// Delete project
storage.deleteProject(projectId);

// Get project data
const data = storage.getProjectData(projectId);

// Access token
const token = storage.getAccessToken();
storage.setAccessToken(token);
```

---

## 🔌 API Integration (Kopyala-Yapıştır)

```typescript
import { api } from '../lib/api';
import { storage } from '../lib/storage';

const accessToken = storage.getAccessToken();

// Get projects
const projects = await api.getProjects(accessToken);

// Create project
const newProject = await api.createProject(projectData, accessToken);

// Delete project
await api.deleteProject(projectId, accessToken);

// Refresh project data
await api.refreshProject(projectId, accessToken);
```

---

## 🧩 Component Pattern (Kopyala-Yapıştır)

```typescript
import { Project } from '../lib/types';
import { storage } from '../lib/storage';

interface MyComponentProps {
  project: Project;
}

export function MyComponent({ project }: MyComponentProps) {
  // 1. Get data from storage
  const storedData = storage.getProjectData(project.id);
  const data = storedData?.specificData;
  
  // 2. Fallback to placeholder
  const displayData = data || placeholderData;
  
  // 3. Render
  return (
    <div className="bg-background text-foreground p-6">
      <h2>{project.name}</h2>
      {/* Your component content */}
    </div>
  );
}
```

---

## 🐛 Debugging

### Console Logs
```typescript
console.log('[ComponentName] Event:', data);
```

### TypeScript Errors
```
⌘/Ctrl + Shift + M → Problems panel
```

### Build Test
```bash
npm run build
```

### Supabase Logs
```bash
supabase functions logs make-server-cf9a9609 --follow
```

---

## ✅ Pre-Commit Checklist

```bash
# 1. TypeScript check
npm run build

# 2. Test locally
npm run dev

# 3. Check console (F12)
# - No errors
# - No warnings

# 4. Verify guidelines
# - Uses storage API (not localStorage)
# - Follows design system
# - TypeScript types correct
```

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
git add .
git commit -m "feat: new feature"
git push origin main
# Vercel auto-deploys
```

### Backend (Supabase)
```bash
supabase functions deploy make-server-cf9a9609
```

---

## 📚 Documentation

| Doc | Purpose |
|-----|---------|
| `CURSOR_SETUP_TR.md` | 🇹🇷 Cursor setup rehberi |
| `guidelines/Guidelines.md` | ⭐ Proje kuralları |
| `API_SPECIFICATION.md` | API endpoints |
| `DEPLOYMENT_GUIDE.md` | Production deployment |
| `CHATGPT_RESPONSE_PARSING.md` | ChatGPT data parsing |

---

## 🔥 Common Tasks

### Add New Dashboard Component
```
⌘/Ctrl + L → AI Chat:

Yeni dashboard component: BrandComparison.tsx
- Dashboard'a yeni tab ekle
- 2 brand karşılaştırma yap
- @guidelines/Guidelines.md design system
- @lib/types.ts 'deki Project type kullan
```

### Fix TypeScript Error
```
⌘/Ctrl + L → AI Chat:

@ComponentName.tsx 'de TypeScript error var:
[error mesajını yapıştır]

@lib/types.ts 'deki tiplere uygun olmalı.
Nasıl düzeltebilirim?
```

### Add API Endpoint
```
⌘/Ctrl + L → AI Chat:

@supabase/functions/server/index.tsx 'e yeni endpoint:
GET /projects/:id/analytics
- Project analytics döndürecek
- Authentication gerekli
- @API_SPECIFICATION.md pattern'i takip et
```

---

## ⚠️ Important Rules

### ✅ DO:
- Use `@guidelines/Guidelines.md` in AI prompts
- Use storage API from `/lib/storage.ts`
- Follow TypeScript types from `/lib/types.ts`
- Test locally before commit (`npm run build`)

### ❌ DON'T:
- Access `localStorage` directly
- Override Tailwind typography unless asked
- Modify `/components/figma/*` files
- Expose `SUPABASE_SERVICE_ROLE_KEY` to frontend
- Create duplicate type definitions

---

## 🎯 First AI Prompt

```
Merhaba Cursor AI! 👋

Bu Brand Sense projesi. Lütfen şu dosyaları oku:
- @guidelines/Guidelines.md
- @README.md
- @lib/types.ts

Proje hakkında kısa bir özet ver:
1. Tech stack nedir?
2. Main components neler?
3. Design system ne?
```

---

**Happy Coding! 🚀**
