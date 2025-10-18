# Backend API Plan - Paddle Integration

## Overview
Backend API implementation for subscription management, usage tracking, and Paddle webhook handling.

## Goal
Create RESTful API endpoints for subscription management, usage limits, and Paddle webhook processing.

## API Endpoints

### 1. Subscription Management Routes
Create `src/supabase/functions/server/subscriptions.ts`:

```typescript
import { Hono } from "npm:hono";
import { getSupabaseAdminClient } from "./utils.ts";

export function setupSubscriptionRoutes(app: Hono) {
  // GET /subscriptions/current
  app.get('/subscriptions/current', async (c) => {
    const userId = c.get('userId');
    
    const supabase = getSupabaseAdminClient();
    
    // Fetch subscription with plan
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        plan:plans(*)
      `)
      .eq('user_id', userId)
      .single();
    
    if (error || !subscription) {
      return c.json({ error: 'Subscription not found' }, 404);
    }
    
  // Fetch current month usage (DATE consistency)
  const now = new Date();
  const currentMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().slice(0, 10);
  const { data: usage } = await supabase
    .from('usage_tracking')
    .select('*')
    .eq('user_id', userId)
    .eq('month', currentMonth)
    .single();
    
    return c.json({
      subscription,
      usage: usage || { projects_created: 0, refreshes_used: 0 },
      limits: {
        max_projects: subscription.plan.max_projects,
        max_refreshes: subscription.plan.max_refreshes
      }
    });
  });

  // POST /subscriptions/create-checkout
  app.post('/subscriptions/create-checkout', async (c) => {
    const userId = c.get('userId');
    const { billing } = await c.req.json();
    const idempotencyKey = c.req.header('Idempotency-Key');
    
    // Get user email
    const supabase = getSupabaseAdminClient();
    const { data: user } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();
    
    if (!user?.email) {
      return c.json({ error: 'User email not found' }, 404);
    }
    
    // Get price ID from environment
    const priceId = billing === 'annual' 
      ? Deno.env.get('PADDLE_PRICE_ID_ANNUAL')
      : Deno.env.get('PADDLE_PRICE_ID_MONTHLY');
    
    // Store idempotency key with TTL (handle conflicts)
    if (idempotencyKey) {
      const { error } = await supabase
        .from('idempotency_keys')
        .insert({
          key: idempotencyKey,
          user_id: userId,
          expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 min TTL
        });
      
      if (error && error.code === '23505') {
        // Key already exists - return existing checkout or error
        return c.json({ error: 'Checkout already in progress' }, 409);
      }
    }
    
    // Create Paddle checkout session (updated API)
    const paddleResponse = await fetch('https://api.paddle.com/checkout-sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PADDLE_API_KEY')}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey || `checkout_${userId}_${Date.now()}`
      },
      body: JSON.stringify({
        items: [{ price_id: priceId, quantity: 1 }],
        customer: { email: user.email },
        custom_data: { user_id: userId }
      })
    });
    
    if (!paddleResponse.ok) {
      const errorData = await paddleResponse.json();
      console.error('Paddle checkout error:', errorData);
      return c.json({ error: 'Failed to create checkout session' }, 500);
    }
    
    const checkout = await paddleResponse.json();
    
    return c.json({ checkout_url: checkout.data.url });
  });

  // POST /subscriptions/cancel
  app.post('/subscriptions/cancel', async (c) => {
    const userId = c.get('userId');
    
    const supabase = getSupabaseAdminClient();
    
    // Get subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('paddle_subscription_id, current_period_end')
      .eq('user_id', userId)
      .single();
    
    if (!subscription?.paddle_subscription_id) {
      return c.json({ error: 'No active subscription' }, 400);
    }
    
    // Cancel in Paddle
    const cancelResponse = await fetch(`https://api.paddle.com/subscriptions/${subscription.paddle_subscription_id}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PADDLE_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ effective_from: 'next_billing_period' })
    });
    
    if (!cancelResponse.ok) {
      const errorData = await cancelResponse.json();
      console.error('Paddle cancel error:', errorData);
      return c.json({ error: 'Failed to cancel subscription' }, 500);
    }
    
    // Update subscription status
    await supabase
      .from('subscriptions')
      .update({ 
        status: 'cancelled',
        cancel_at: subscription.current_period_end
      })
      .eq('user_id', userId);
    
    return c.json({ success: true });
  });

  // GET /subscriptions/portal
  app.get('/subscriptions/portal', async (c) => {
    const userId = c.get('userId');
    
    const supabase = getSupabaseAdminClient();
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('paddle_customer_id')
      .eq('user_id', userId)
      .single();
    
    if (!subscription?.paddle_customer_id) {
      return c.json({ error: 'No customer ID found' }, 400);
    }
    
    // Create Paddle portal session (updated API)
    const paddleResponse = await fetch('https://api.paddle.com/customer-portal-sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PADDLE_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customer_id: subscription.paddle_customer_id
      })
    });
    
    const portal = await paddleResponse.json();
    
    return c.json({ portal_url: portal.data.url });
  });
}
```

### 2. Usage Tracking Middleware
Create `src/supabase/functions/server/usage-middleware.ts`:

```typescript
import { getSupabaseAdminClient } from "./utils.ts";

export async function checkProjectLimit(userId: string) {
  const supabase = getSupabaseAdminClient();
  
  // Get subscription and plan
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_id, plans(max_projects)')
    .eq('user_id', userId)
    .single();
  
  if (!subscription) {
    return { allowed: false, current: 0, limit: 0, plan: 'free' };
  }
  
  // Count active (non-archived) projects
  const { count } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_archived', false);
  
  const maxProjects = subscription.plans.max_projects;
  
  return {
    allowed: count < maxProjects,
    current: count || 0,
    limit: maxProjects,
    plan: subscription.plan_id
  };
}

export async function checkRefreshLimit(userId: string) {
  const supabase = getSupabaseAdminClient();
  
  // Get subscription and plan
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_id, plans(max_refreshes)')
    .eq('user_id', userId)
    .single();
  
  if (!subscription) {
    return { allowed: false, current: 0, limit: 20, plan: 'free' };
  }
  
  // Pro plan has unlimited refreshes
  if (subscription.plans.max_refreshes === null) {
    return { allowed: true, current: 0, limit: null, plan: subscription.plan_id };
  }
  
  // Get current month usage (DATE consistency)
  const now = new Date();
  const currentMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().slice(0, 10);
  const { data: usage } = await supabase
    .from('usage_tracking')
    .select('refreshes_used')
    .eq('user_id', userId)
    .eq('month', currentMonth)
    .single();
  
  const refreshesUsed = usage?.refreshes_used || 0;
  const maxRefreshes = subscription.plans.max_refreshes;
  
  return {
    allowed: refreshesUsed < maxRefreshes,
    current: refreshesUsed,
    limit: maxRefreshes,
    plan: subscription.plan_id
  };
}

export async function trackProjectCreation(userId: string) {
  const supabase = getSupabaseAdminClient();
  
  // Fix: Remove p_month parameter (function doesn't accept it)
  await supabase.rpc('increment_project_usage', {
    p_user_id: userId
  });
}

export async function trackRefreshUsage(userId: string) {
  const supabase = getSupabaseAdminClient();
  
  // Fix: Remove p_month parameter (function doesn't accept it)
  await supabase.rpc('increment_refresh_usage', {
    p_user_id: userId
  });
}

export async function checkDashboardAccess(userId: string, dashboard: string) {
  const supabase = getSupabaseAdminClient();
  
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_id, plans(dashboards)')
    .eq('user_id', userId)
    .single();
  
  if (!subscription) {
    return { allowed: dashboard === 'keyword', plan: 'free' };
  }
  
  const dashboards = subscription.plans.dashboards || [];
  
  return {
    allowed: dashboards.includes(dashboard),
    plan: subscription.plan_id
  };
}
```

### 3. Update Project Routes
Modify `src/supabase/functions/server/projects.ts`:

```typescript
import { checkProjectLimit, checkRefreshLimit, trackProjectCreation, trackRefreshUsage } from "./usage-middleware.ts";

// POST /projects/create
app.post('/projects/create', async (c) => {
  const userId = c.get('userId');
  
  // Check project limit
  const limitCheck = await checkProjectLimit(userId);
  if (!limitCheck.allowed) {
    return c.json({
      error: 'plan_limit_reached',
      limit_type: 'projects',
      current_plan: limitCheck.plan,
      usage: { projects: limitCheck.current, limit: limitCheck.limit }
    }, 403);
  }
  
  // ... existing project creation logic ...
  
  // Track project creation
  await trackProjectCreation(userId);
  
  return c.json({ success: true, project });
});

// POST /projects/:id/refresh
app.post('/projects/:id/refresh', async (c) => {
  const userId = c.get('userId');
  
  // Check refresh limit
  const limitCheck = await checkRefreshLimit(userId);
  if (!limitCheck.allowed) {
    return c.json({
      error: 'plan_limit_reached',
      limit_type: 'refreshes',
      current_plan: limitCheck.plan,
      usage: { refreshes: limitCheck.current, limit: limitCheck.limit }
    }, 403);
  }
  
  // ... existing refresh logic ...
  
  // Track refresh usage
  await trackRefreshUsage(userId);
  
  return c.json({ success: true });
});
```

### 4. User Creation Hook
Update `src/supabase/functions/server/auth.ts`:

```typescript
// POST /auth/signup
app.post('/auth/signup', async (c) => {
  // ... existing signup logic ...
  
  const userId = authUser.id;
  
  // Create Free subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .insert({
      user_id: userId,
      plan_id: 'free',
      status: 'active',
      current_period_start: new Date().toISOString()
    })
    .select()
    .single();
  
  // Update user with subscription_id
  await supabase
    .from('users')
    .update({ subscription_id: subscription.id })
    .eq('id', userId);
  
  // Create usage tracking (DATE consistency)
  const now = new Date();
  const currentMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().slice(0, 10);
  await supabase
    .from('usage_tracking')
    .insert({
      user_id: userId,
      month: currentMonth,
      projects_created: 0,
      refreshes_used: 0
    });
  
  // ... return success ...
});
```

### 5. Usage Routes (MISSING ENDPOINTS)
Create `src/supabase/functions/server/usage-routes.ts`:

```typescript
import { Hono } from "npm:hono";
import { checkProjectLimit, checkRefreshLimit, checkDashboardAccess } from "./usage-middleware.ts";

export function setupUsageRoutes(app: Hono) {
  // GET /usage/check-project-limit
  app.get('/usage/check-project-limit', async (c) => {
    const userId = c.get('userId');
    const result = await checkProjectLimit(userId);
    return c.json(result);
  });

  // GET /usage/check-refresh-limit
  app.get('/usage/check-refresh-limit', async (c) => {
    const userId = c.get('userId');
    const result = await checkRefreshLimit(userId);
    return c.json(result);
  });

  // GET /usage/check-dashboard-access
  app.get('/usage/check-dashboard-access', async (c) => {
    const userId = c.get('userId');
    const dashboard = c.req.query('dashboard') || 'keyword';
    const result = await checkDashboardAccess(userId, dashboard);
    return c.json(result);
  });
}
```

### 6. Rate Limiting Middleware
Create `src/supabase/functions/server/rate-limiting.ts`:

```typescript
import { getSupabaseAdminClient } from "./utils.ts";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const RATE_LIMITS = {
  refresh: { windowMs: 5 * 60 * 1000, maxRequests: 30 }, // 30 requests per 5 minutes
  daily: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 1000 } // 1000 requests per day
};

export async function checkRateLimit(userId: string, type: 'refresh' | 'daily'): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime: number;
}> {
  const supabase = getSupabaseAdminClient();
  const config = RATE_LIMITS[type];
  const now = Date.now();
  const windowStart = now - config.windowMs;

  // Get recent requests
  const { data: requests } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('user_id', userId)
    .eq('type', type)
    .gte('created_at', new Date(windowStart).toISOString());

  const requestCount = requests?.length || 0;
  const allowed = requestCount < config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - requestCount);
  const resetTime = now + config.windowMs;

  if (allowed) {
    // Record this request
    await supabase
      .from('rate_limits')
      .insert({
        user_id: userId,
        type,
        created_at: new Date().toISOString()
      });
  }

  return { allowed, remaining, resetTime };
}
```

### 7. Grace Period Handling
Update `src/supabase/functions/server/subscriptions.ts`:

```typescript
// Add grace period fields to subscriptions table
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS grace_start TIMESTAMP;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS grace_until TIMESTAMP;

// Update past_due handler
async function handleSubscriptionPastDue(event: any) {
  const supabase = getSupabaseAdminClient();
  const graceUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days grace
  
  await supabase
    .from('subscriptions')
    .update({ 
      status: 'past_due',
      grace_start: new Date().toISOString(),
      grace_until: graceUntil.toISOString()
    })
    .eq('paddle_subscription_id', event.data.id);
  
  // Send payment failed email
  await sendEmail(user.email, 'payment_failed', {
    portal_url: `https://checkout.paddle.com/customer-portal/${event.data.customer_id}`,
    grace_period_end: graceUntil.toISOString()
  });
}
```

### 8. Grace Period Cron Job
Create `src/supabase/functions/grace-period-cron/index.ts`:

```typescript
import { getSupabaseAdminClient } from "../server/utils.ts";
import { handleDowngradeToFree } from "../server/downgrade-handler.ts";

Deno.serve(async (req) => {
  const supabase = getSupabaseAdminClient();
  
  // Find subscriptions past grace period
  const { data: expiredSubscriptions } = await supabase
    .from('subscriptions')
    .select('user_id, paddle_subscription_id')
    .eq('status', 'past_due')
    .lt('grace_until', new Date().toISOString());
  
  if (!expiredSubscriptions || expiredSubscriptions.length === 0) {
    return new Response(JSON.stringify({ 
      success: true, 
      processed: 0,
      message: 'No expired subscriptions found'
    }));
  }
  
  // Downgrade each expired subscription
  for (const sub of expiredSubscriptions) {
    // Update to Free plan
    await supabase
      .from('subscriptions')
      .update({
        plan_id: 'free',
        status: 'active',
        grace_start: null,
        grace_until: null
      })
      .eq('user_id', sub.user_id);
    
    // Handle project archiving
    await handleDowngradeToFree(sub.user_id);
  }
  
  return new Response(JSON.stringify({ 
    success: true,
    processed: expiredSubscriptions.length,
    message: `Downgraded ${expiredSubscriptions.length} expired subscriptions`
  }));
});
```

### 9. Register Routes in Index
Update `src/supabase/functions/server/index.tsx`:

```typescript
import { setupSubscriptionRoutes } from "./subscriptions.ts";
import { setupUsageRoutes } from "./usage-routes.ts";

// ... existing imports ...

const app = new Hono();

// ... existing routes ...

// Register subscription routes
setupSubscriptionRoutes(app);

// Register usage routes (MISSING ENDPOINTS)
setupUsageRoutes(app);

// ... rest of code ...
```

## Files to Create/Modify

- `src/supabase/functions/server/subscriptions.ts` - Subscription API routes
- `src/supabase/functions/server/usage-middleware.ts` - Usage tracking middleware
- `src/supabase/functions/server/usage-routes.ts` - Missing usage endpoints
- `src/supabase/functions/server/rate-limiting.ts` - Rate limiting middleware
- `src/supabase/functions/server/projects.ts` - Update with limit checks
- `src/supabase/functions/server/auth.ts` - Update signup hook
- `src/supabase/functions/grace-period-cron/index.ts` - Grace period automation
- `src/supabase/functions/server/index.tsx` - Register new routes

## Timeline

- Subscription routes: 1 day
- Usage middleware: 1 day
- Project route updates: 0.5 day
- Auth hook updates: 0.5 day
- Testing: 1 day
- **Total: 4 days**

## Dependencies

- Database schema must be created first
- Paddle API credentials must be configured
