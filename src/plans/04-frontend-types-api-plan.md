# Frontend Types & API Plan - Paddle Integration

## Overview
Frontend TypeScript types and API client implementation for Paddle payment integration.

## Goal
Create type-safe API clients and interfaces for subscription management, usage tracking, and Paddle SDK integration.

## TypeScript Types

### 1. Core Interfaces
Update `src/lib/types.ts`:

```typescript
// Plan interface
export interface Plan {
  id: 'free' | 'pro';
  name: string;
  price_monthly: number;
  price_annual: number;
  max_projects: number;
  max_refreshes: number | null; // null = unlimited
  dashboards: ('keyword' | 'sentiment' | 'brand_identity')[];
  features: string[];
}

// Subscription interface
export interface Subscription {
  id: string;
  user_id: string;
  plan_id: 'free' | 'pro';
  status: 'active' | 'cancelled' | 'past_due' | 'paused';
  paddle_subscription_id: string | null;
  paddle_customer_id: string | null;
  current_period_start: string;
  current_period_end: string;
  cancel_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  plan: Plan; // Joined data
}

// Usage statistics interface
export interface UsageStats {
  projects_created: number;
  refreshes_used: number;
  limits: {
    max_projects: number;
    max_refreshes: number | null;
  };
}

// Plan limit error interface
export interface PlanLimitError {
  error: 'plan_limit_reached';
  limit_type: 'projects' | 'refreshes';
  current_plan: 'free' | 'pro';
  usage: UsageStats;
}

// API response interfaces
export interface SubscriptionResponse {
  subscription: Subscription;
  usage: UsageStats;
  limits: {
    max_projects: number;
    max_refreshes: number | null;
  };
}

export interface CheckoutResponse {
  checkout_url: string;
}

export interface PortalResponse {
  portal_url: string;
}

export interface LimitCheckResponse {
  allowed: boolean;
  current: number;
  limit: number | null;
  plan: string;
}

export interface DashboardAccessResponse {
  allowed: boolean;
  plan: string;
}
```

## API Client Implementation

### 2. Subscription API Client
Create `src/lib/subscription-api.ts`:

```typescript
import { API_CONFIG } from './api';
import { storage } from './storage';
import { 
  SubscriptionResponse, 
  CheckoutResponse, 
  PortalResponse, 
  LimitCheckResponse, 
  DashboardAccessResponse 
} from './types';

export async function getCurrentSubscription(): Promise<SubscriptionResponse> {
  const token = storage.getAccessToken();
  const response = await fetch(
    `${API_CONFIG.BASE_URL}/subscriptions/current`,
    { 
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10000)
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch subscription: ${response.status}`);
  }
  
  return response.json();
}

export async function createCheckoutSession(billing: 'monthly' | 'annual'): Promise<CheckoutResponse> {
  const token = storage.getAccessToken();
  
  // Generate idempotency key for duplicate prevention
  const idempotencyKey = `checkout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const response = await fetch(
    `${API_CONFIG.BASE_URL}/subscriptions/create-checkout`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify({ billing }),
      signal: AbortSignal.timeout(10000)
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to create checkout: ${response.status}`);
  }
  
  return response.json();
}

export async function cancelSubscription(): Promise<{ success: boolean }> {
  const token = storage.getAccessToken();
  const response = await fetch(
    `${API_CONFIG.BASE_URL}/subscriptions/cancel`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10000)
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to cancel subscription: ${response.status}`);
  }
  
  return response.json();
}

export async function getPortalUrl(): Promise<PortalResponse> {
  const token = storage.getAccessToken();
  const response = await fetch(
    `${API_CONFIG.BASE_URL}/subscriptions/portal`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to get portal URL: ${response.status}`);
  }
  
  return response.json();
}

export async function checkCanCreateProject(): Promise<LimitCheckResponse> {
  const token = storage.getAccessToken();
  const response = await fetch(
    `${API_CONFIG.BASE_URL}/usage/check-project-limit`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to check project limit: ${response.status}`);
  }
  
  return response.json();
}

export async function checkCanRefresh(): Promise<LimitCheckResponse> {
  const token = storage.getAccessToken();
  const response = await fetch(
    `${API_CONFIG.BASE_URL}/usage/check-refresh-limit`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to check refresh limit: ${response.status}`);
  }
  
  return response.json();
}

export async function checkDashboardAccess(dashboard: 'keyword' | 'sentiment' | 'brand_identity'): Promise<DashboardAccessResponse> {
  const token = storage.getAccessToken();
  const response = await fetch(
    `${API_CONFIG.BASE_URL}/usage/check-dashboard-access?dashboard=${dashboard}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to check dashboard access: ${response.status}`);
  }
  
  return response.json();
}
```

### 3. Paddle SDK Client
Create `src/lib/paddle-client.ts`:

```typescript
declare global {
  interface Window {
    Paddle: any;
    paddleCheckoutOpen?: boolean;
  }
}

let paddleInitialized = false;

export function initializePaddle(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (paddleInitialized) return Promise.resolve();
  
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    script.async = true;
    script.onload = () => {
      // Paddle v2 Initialize (no vendor needed)
      window.Paddle.Initialize({
        token: import.meta.env.VITE_PADDLE_CLIENT_TOKEN,
        environment: import.meta.env.VITE_PADDLE_ENVIRONMENT || 'sandbox',
        eventCallback: handlePaddleEvent
      });
      paddleInitialized = true;
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export function openPaddleCheckout(
  priceId: string,
  email: string,
  onSuccess: () => void,
  onClose: () => void
) {
  if (!paddleInitialized) {
    console.error('Paddle not initialized');
    return;
  }
  
  // Double-submit guard
  if (window.paddleCheckoutOpen) {
    console.warn('Checkout already open');
    return;
  }
  
  window.paddleCheckoutOpen = true;
  
  window.Paddle.Checkout.open({
    items: [{ priceId, quantity: 1 }],
    customer: { email },
    successCallback: () => {
      window.paddleCheckoutOpen = false;
      onSuccess();
    },
    closeCallback: () => {
      window.paddleCheckoutOpen = false;
      onClose();
    }
  });
}

export function openPaddlePortal(subscriptionId: string) {
  if (!paddleInitialized) {
    console.error('Paddle not initialized');
    return;
  }
  
  window.Paddle.Portal.open({
    subscriptionId
  });
}

function handlePaddleEvent(event: any) {
  console.log('[Paddle Event]', event.name, event.data);
  
  // Handle specific events
  switch (event.name) {
    case 'checkout.completed':
      console.log('Checkout completed:', event.data);
      break;
    case 'checkout.closed':
      console.log('Checkout closed:', event.data);
      break;
    default:
      console.log('Unhandled Paddle event:', event.name);
  }
}

export function isPaddleInitialized(): boolean {
  return paddleInitialized;
}
```

### 4. Error Handling
Update `src/lib/api.ts`:

```typescript
import { toast } from "sonner";
import { PlanLimitError } from './types';

export function handleApiError(error: any, context: string = '') {
  console.error(`[API Error] ${context}:`, error);
  
  // Handle plan limit errors
  if (error.error === 'plan_limit_reached') {
    handlePlanLimitError(error as PlanLimitError);
    return;
  }
  
  // Handle network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    toast.error('Network Error', {
      description: 'Please check your internet connection and try again.'
    });
    return;
  }
  
  // Handle timeout errors
  if (error.name === 'AbortError') {
    toast.error('Request Timeout', {
      description: 'The request took too long. Please try again.'
    });
    return;
  }
  
  // Handle 401 errors (unauthorized)
  if (error.status === 401) {
    toast.error('Session Expired', {
      description: 'Please sign in again to continue.'
    });
    // Redirect to sign in
    window.location.href = '/signin';
    return;
  }
  
  // Handle 403 errors (forbidden)
  if (error.status === 403) {
    toast.error('Access Denied', {
      description: 'You do not have permission to perform this action.'
    });
    return;
  }
  
  // Generic error
  toast.error('Something went wrong', {
    description: error.message || 'Please try again later.'
  });
}

function handlePlanLimitError(error: PlanLimitError) {
  const message = error.limit_type === 'projects'
    ? `You've reached your ${error.current_plan} plan limit (${error.usage.limits.max_projects} project${error.usage.limits.max_projects > 1 ? 's' : ''}).`
    : `You've used all ${error.usage.limits.max_refreshes} refreshes this month.`;
  
  toast.error('Plan Limit Reached', {
    description: message,
    action: {
      label: 'Upgrade to Pro',
      onClick: () => {
        // Trigger upgrade modal
        window.dispatchEvent(new CustomEvent('open-upgrade-modal', { 
          detail: { limitType: error.limit_type } 
        }));
      }
    },
    duration: 10000
  });
}

// API wrapper with error handling
export async function apiCall<T>(
  url: string, 
  options: RequestInit = {},
  context: string = ''
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw { ...errorData, status: response.status };
    }
    
    return await response.json();
  } catch (error) {
    handleApiError(error, context);
    throw error;
  }
}
```

### 5. Environment Variables
Update `.env`:

```bash
# Paddle Configuration (Sandbox)
VITE_PADDLE_VENDOR_ID=123456
VITE_PADDLE_CLIENT_TOKEN=test_xxxxxxxxxxxx
VITE_PADDLE_ENVIRONMENT=sandbox
VITE_PADDLE_PRICE_ID_MONTHLY=pri_01xxxxx
VITE_PADDLE_PRICE_ID_ANNUAL=pri_01yyyyy

# Backend Environment
PADDLE_ENV=sandbox
PADDLE_API_KEY=test_xxxxxxxxxxxx
PADDLE_WEBHOOK_SECRET=pdl_ntfset_xxxxxxxxxxxx
```

## Files to Create/Modify

- `src/lib/types.ts` - Add subscription interfaces
- `src/lib/subscription-api.ts` - API client functions
- `src/lib/paddle-client.ts` - Paddle SDK integration
- `src/lib/api.ts` - Update error handling
- `.env` - Add Paddle environment variables

## Timeline

- TypeScript types: 0.5 day
- Subscription API client: 1 day
- Paddle SDK client: 0.5 day
- Error handling: 0.5 day
- Testing: 0.5 day
- **Total: 3 days**

## Dependencies

- Backend API routes must be implemented
- Paddle account setup must be completed
- Environment variables must be configured
