# Paddle Payment Integration - MAIN PLAN

## 🤖 AI Kullanıcısı İçin Ön Hazırlık Adımları

### ⚠️ KRİTİK: AI Execute Etmeden Önce Yapılması Gerekenler

Bu plan **%95 AI-executable** ancak şu adımlar **manuel olarak** yapılmalı:

#### **1. Paddle Account Setup (5 dakika)**

1. Paddle hesabı oluştur: https://paddle.com → Sign Up
2. Sandbox mode'a geç
3. Verification process'i tamamla
4. Dashboard'a erişim sağla

#### **2. Paddle Products Oluştur (10 dakika)**

Dashboard → Catalog → Products → Add Product

**Product 1: Pro Monthly**
- Name: "BrandSense Professional - Monthly"
- Type: Subscription
- Billing: Monthly
- Price: $9.99 USD
- → Copy **Price ID** (pri_01xxx)

**Product 2: Pro Annual**
- Name: "BrandSense Professional - Annual"
- Type: Subscription
- Billing: Yearly
- Price: $100 USD
- → Copy **Price ID** (pri_01yyy)

#### **3. Paddle Webhook Configure (5 dakika)**

Dashboard → Developer Tools → Notifications → Add Notification Destination

- URL: `https://[your-project].supabase.co/functions/v1/make-server-cf9a9609/paddle-webhook`
- Events: subscription.created, subscription.updated, subscription.cancelled, transaction.completed, subscription.past_due
- → Copy **Webhook Secret** (pdl_ntfset_xxx)

#### **4. Paddle API Credentials (3 dakika)**

Dashboard → Developer Tools → Authentication
- Create API Key: "BrandSense Backend"
- Permissions: Read/Write
- → Copy **API Key** (test_xxx or live_xxx)

Dashboard → Developer Tools → Client-side tokens
- → Copy **Vendor ID** (6 digit number)
- → Copy **Client Token** (test_xxx or live_xxx)

#### **5. Environment Variables Setup (2 dakika)**

**Frontend (.env):**
```bash
VITE_PADDLE_VENDOR_ID=123456
VITE_PADDLE_CLIENT_TOKEN=test_xxxxxxxxxxxx
VITE_PADDLE_ENVIRONMENT=sandbox
VITE_PADDLE_PRICE_ID_MONTHLY=pri_01xxxxx
VITE_PADDLE_PRICE_ID_ANNUAL=pri_01yyyyy
```

**Backend (Supabase Secrets):**
```bash
PADDLE_API_KEY=test_xxxxxxxxxxxx
PADDLE_WEBHOOK_SECRET=pdl_ntfset_xxxxxxxxxxxx
PADDLE_PRICE_ID_MONTHLY=pri_01xxxxx
PADDLE_PRICE_ID_ANNUAL=pri_01yyyyy
```

### **AI Execute Edilebilir Kısımlar (31 Todo)**

✅ **Backend (11 todo)**: Database, API, webhooks, migration
✅ **Frontend (12 todo)**: UI components, API clients, paywalls
✅ **Legal (5 todo)**: Documents, email templates
✅ **Testing (3 todo)**: Backend/frontend testing, deployment

### **AI Execute Edilemeyen Kısımlar (Manual)**

❌ **Paddle Account Setup** - Manuel registration
❌ **Product Creation** - Paddle dashboard'da manual
❌ **Webhook Configuration** - Paddle dashboard'da manual
❌ **API Key Generation** - Paddle dashboard'da manual
❌ **Environment Variables** - Manuel .env setup
❌ **Production Deployment** - Manuel Vercel/Supabase deploy

### **Execute Sırası**

```
1. MANUAL: Paddle setup (yukarıdaki 5 adım)
2. AI: Execute plan (31 todo sequential)
3. MANUAL: Production deployment
```

### **Başarı Kriterleri**

- ✅ Paddle sandbox'ta 2 product oluşturuldu
- ✅ Webhook URL configure edildi
- ✅ API credentials alındı
- ✅ Environment variables set edildi
- ✅ AI plan execution başlayabilir

---

## Overview

Complete end-to-end implementation of Paddle payment system with Free and Pro subscription plans. Covers backend infrastructure, API endpoints, webhook handling, frontend UI, paywalls, billing management, migration strategy, Paddle configuration, error handling, and production deployment.

## Sub-Plans

### **1. Database Schema Plan**
📁 [01-database-schema-plan.md](./01-database-schema-plan.md)
- Database tables (plans, subscriptions, usage_tracking, paddle_events)
- Migration script for existing users
- RLS policies and indexes
- Database functions for usage tracking
- **Timeline: 2 days**

### **2. Backend API Plan**
📁 [02-backend-api-plan.md](./02-backend-api-plan.md)
- Subscription management routes
- Usage tracking middleware
- Project route updates with limit checks
- User creation hook for Free subscription
- **Timeline: 4 days**

### **3. Paddle Webhook Plan**
📁 [03-paddle-webhook-plan.md](./03-paddle-webhook-plan.md)
- Webhook endpoint with signature verification
- Event handlers (created, cancelled, past_due)
- Downgrade handler for project archiving
- Monthly usage reset cron job
- **Timeline: 4 days**

### **4. Frontend Types & API Plan**
📁 [04-frontend-types-api-plan.md](./04-frontend-types-api-plan.md)
- TypeScript interfaces (Plan, Subscription, UsageStats)
- Subscription API client
- Paddle SDK client
- Error handling and timeout logic
- **Timeline: 3 days**

### **5. Frontend UI Components Plan**
📁 [05-frontend-ui-components-plan.md](./05-frontend-ui-components-plan.md)
- Plan limit modal
- Dashboard paywall overlay
- Billing settings page
- Usage indicators and loading states
- **Timeline: 6 days**

### **6. Legal & Communication Plan**
📁 [06-legal-communication-plan.md](./06-legal-communication-plan.md)
- Terms of Service updates
- Privacy Policy updates
- Refund Policy creation
- Email templates and service integration
- **Timeline: 4 days**

## Implementation Strategy

### **Phase 1: Foundation (6 days)**
1. Database Schema (2 days)
2. Backend API (4 days)

### **Phase 2: Integration (7 days)**
3. Paddle Webhook (4 days)
4. Frontend Types & API (3 days)

### **Phase 3: User Experience (10 days)**
5. Frontend UI Components (6 days)
6. Legal & Communication (4 days)

### **Phase 4: Testing & Deployment (3 days)**
- Backend testing
- Frontend testing
- Production deployment

## Dependencies

```
Database Schema → Backend API → Paddle Webhook
     ↓              ↓              ↓
Frontend Types → UI Components → Legal & Communication
     ↓              ↓              ↓
              Testing & Deployment
```

## Success Metrics

- ✅ Free users limited to 1 project and 20 refreshes/month
- ✅ Pro users can create 10 projects with unlimited refreshes
- ✅ Dashboard access control working (Free: keyword only, Pro: all 3)
- ✅ Paddle webhook events processed successfully
- ✅ Zero data loss during plan downgrades
- ✅ Automated email notifications working
- ✅ Legal compliance achieved
- ✅ Rate limiting prevents abuse
- ✅ Webhook idempotency prevents duplicate processing
- ✅ Grace period handling for failed payments
- ✅ Complete RLS policies for security
- ✅ All missing API endpoints implemented

## Timeline Summary

- **Backend (Phases 1-2)**: 10 days
- **Frontend (Phase 3)**: 10 days  
- **Testing & Deploy**: 3 days
- **Total: 23 days (4.5 weeks)**

## Critical Fixes Applied

### **Database Schema (01)**
- ✅ Complete RLS policies (INSERT/UPDATE)
- ✅ Updated_at triggers
- ✅ UUID extension
- ✅ Date handling (UTC)
- ✅ DLQ fields (retry_count, status)
- ✅ Index optimizations

### **Backend API (02)**
- ✅ Missing usage routes (3 endpoints)
- ✅ Rate limiting middleware
- ✅ Grace period handling
- ✅ Downgrade automation

### **Paddle Webhook (03)**
- ✅ Idempotency checks
- ✅ DLQ (Dead Letter Queue)
- ✅ Webhook signature security
- ✅ Retry logic (3 attempts)
- ✅ Timestamp tolerance (±5 min)

### **Frontend Types (04)**
- ✅ Paddle JS client token
- ✅ Environment handling
- ✅ Double-submit guard

### **UI Components (05)**
- ✅ Rate limiting UI indicators
- ✅ Grace period warnings
- ✅ Enhanced error handling

### **Legal & Communication (06)**
- ✅ MoR (Merchant of Record) açıklaması
- ✅ Otomatik yenileme detayları
- ✅ Vergi dahil/hariç
- ✅ TR/EU cayma hakkı
- ✅ B2B VAT ID
- ✅ No trial period açıklaması

## Additional Critical Fixes Applied

### **Database Schema (01)**
- ✅ Rate limiting table added
- ✅ Proper indexing for performance

### **Backend API (02)**
- ✅ Function-middleware parameter fix
- ✅ Grace period cron job
- ✅ Idempotency key support

### **Paddle Webhook (03)**
- ✅ Replay protection with timestamp tracking
- ✅ Processing status to prevent concurrent execution
- ✅ Enhanced security with nonce validation

### **Frontend Types (04)**
- ✅ Idempotency key for checkout requests
- ✅ Enhanced error handling

### **UI Components (05)**
- ✅ Trial period clarification in UI
- ✅ Enhanced rate limiting indicators

### **Legal & Communication (06)**
- ✅ No trial period legal clarification
- ✅ Enhanced MoR documentation

## Final Production-Ready Fixes Applied

### **Database Schema (01)**
- ✅ Rate limiting table added
- ✅ Proper indexing for performance
- ✅ Unique constraints for paddle_subscription_id (portable)
- ✅ INTEGER prices (cents) for rounding safety
- ✅ RLS policy using auth.role()
- ✅ idempotency_keys table created
- ✅ DATE consistency in migration
- ✅ **CRITICAL FIX**: Plans table INTEGER from start (no DECIMAL→INTEGER conversion)
- ✅ **CRITICAL FIX**: SECURITY DEFINER functions with RLS bypass
- ✅ **CRITICAL FIX**: Rate limits cleanup function (14 days retention)

### **Backend API (02)**
- ✅ Function-middleware parameter fix
- ✅ Grace period cron job
- ✅ Idempotency key support
- ✅ Paddle session API (checkout-sessions, customer-portal-sessions)
- ✅ User email validation
- ✅ DATE consistency in usage tracking
- ✅ **CRITICAL FIX**: Idempotency key conflict handling (409 response)
- ✅ **CRITICAL FIX**: Paddle API error handling and logging
- ✅ **CRITICAL FIX**: Cancel endpoint error handling

### **Paddle Webhook (03)**
- ✅ Replay protection with timestamp tracking
- ✅ Processing status to prevent concurrent execution
- ✅ Enhanced security with nonce validation
- ✅ Deno Web Crypto (crypto.subtle) implementation
- ✅ Constant-time comparison
- ✅ Grace period enforcement
- ✅ User email fetch for notifications
- ✅ Race condition prevention in event logging
- ✅ **CRITICAL FIX**: Removed Node crypto import (Deno Web Crypto only)
- ✅ **CRITICAL FIX**: processed_at only set on completion (not during processing)
- ✅ **CRITICAL FIX**: Idempotency key conflict handling (23505 error)

### **Frontend Types (04)**
- ✅ Idempotency key for checkout requests
- ✅ Enhanced error handling
- ✅ Environment management (PADDLE_ENV)
- ✅ Window declarations for TypeScript
- ✅ **CRITICAL FIX**: Paddle v2 Initialize (no vendor needed)
- ✅ **CRITICAL FIX**: Portal URL handling (no client-side API)

### **UI Components (05)**
- ✅ Trial period clarification in UI
- ✅ Enhanced rate limiting indicators
- ✅ BillingSettings import fixes
- ✅ **CRITICAL FIX**: Tax calculation notice in pricing
- ✅ **CRITICAL FIX**: Annual plan option display ($100/year)

### **Legal & Communication (06)**
- ✅ No trial period legal clarification
- ✅ Enhanced MoR documentation
- ✅ Legal consistency (trial vs refund policy)
- ✅ **CRITICAL FIX**: Tax handling clarification (Paddle calculates taxes)
- ✅ **CRITICAL FIX**: B2B VAT ID collection notice

## Files Structure

```
src/
├── plans/
│   ├── 00-main-plan.md (this file)
│   ├── 01-database-schema-plan.md
│   ├── 02-backend-api-plan.md
│   ├── 03-paddle-webhook-plan.md
│   ├── 04-frontend-types-api-plan.md
│   ├── 05-frontend-ui-components-plan.md
│   └── 06-legal-communication-plan.md
├── database/
├── supabase/functions/
├── components/
└── lib/
```

## Next Steps

1. **Complete Paddle setup** (manual, 25 minutes)
2. **Execute Database Schema plan** (AI, 2 days)
3. **Execute Backend API plan** (AI, 4 days)
4. **Execute Paddle Webhook plan** (AI, 4 days)
5. **Execute Frontend plans** (AI, 9 days)
6. **Execute Legal plan** (AI, 4 days)
7. **Testing & Deployment** (AI + Manual, 3 days)

**Ready to start? Begin with Paddle account setup!** 🚀
