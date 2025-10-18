# Paddle Webhook Plan - Payment Integration

## Overview
Paddle webhook handler implementation for subscription events, payment processing, and automated plan management.

## Goal
Create secure webhook endpoint to handle Paddle subscription events and update user plans automatically.

## Webhook Implementation

### 1. Webhook Endpoint
Create `src/supabase/functions/server/paddle-webhook.ts`:

```typescript
import { Hono } from "npm:hono";
import { getSupabaseAdminClient } from "./utils.ts";
// Remove Node crypto import - use Deno Web Crypto instead

export function setupPaddleWebhook(app: Hono) {
  app.post('/paddle-webhook', async (c) => {
    // 1. Verify webhook signature
    const signature = c.req.header('Paddle-Signature');
    const body = await c.req.text();
    
    if (!verifyWebhookSignature(signature, body)) {
      return c.json({ error: 'Invalid signature' }, 401);
    }
    
    const event = JSON.parse(body);
    
    // 2. Log event
    await logPaddleEvent(event);
    
    // 3. Handle event
    try {
      switch (event.event_type) {
        case 'subscription.created':
          await handleSubscriptionCreated(event);
          break;
        case 'subscription.updated':
          await handleSubscriptionUpdated(event);
          break;
        case 'subscription.cancelled':
          await handleSubscriptionCancelled(event);
          break;
        case 'transaction.completed':
          await handleTransactionCompleted(event);
          break;
        case 'subscription.past_due':
          await handleSubscriptionPastDue(event);
          break;
        default:
          console.log(`Unhandled event type: ${event.event_type}`);
      }
      
      await markEventProcessed(event.event_id);
    } catch (error) {
      await markEventFailed(event.event_id, error.message);
      throw error;
    }
    
    return c.json({ received: true });
  });
}

async function verifyWebhookSignature(signature: string, body: string): Promise<boolean> {
  const secret = Deno.env.get('PADDLE_WEBHOOK_SECRET');
  if (!secret) {
    console.error('PADDLE_WEBHOOK_SECRET not configured');
    return false;
  }
  
  // Parse signature format: "t=timestamp,v1=signature"
  const sigParts = signature.split(',');
  const timestamp = sigParts.find(p => p.startsWith('t='))?.split('=')[1];
  const sig = sigParts.find(p => p.startsWith('v1='))?.split('=')[1];
  
  if (!timestamp || !sig) {
    return false;
  }
  
  // Check timestamp tolerance (±5 minutes)
  const now = Math.floor(Date.now() / 1000);
  const tolerance = 300; // 5 minutes
  const eventTime = parseInt(timestamp);
  
  if (Math.abs(now - eventTime) > tolerance) {
    console.error('Webhook timestamp too old');
    return false;
  }
  
  // Use Deno Web Crypto for HMAC
  const expectedSignature = await hmac(body, secret);
  
  // Constant-time comparison
  return timingSafeEqual(sig, expectedSignature);
}

async function hmac(body: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2,'0')).join('');
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function logPaddleEvent(event: any) {
  const supabase = getSupabaseAdminClient();
  
  // Check for duplicate events (idempotency) - replay guard after verification
  const { data: existingEvent } = await supabase
    .from('paddle_events')
    .select('id, status')
    .eq('event_id', event.event_id)
    .maybeSingle();
  
  if (existingEvent) {
    if (existingEvent.status === 'completed') {
      console.log(`Event ${event.event_id} already processed`);
      return;
    }
    if (existingEvent.status === 'processing') {
      console.log(`Event ${event.event_id} currently processing`);
      return;
    }
  }
  
  // Insert with conflict handling to prevent race conditions
  const { error } = await supabase
    .from('paddle_events')
    .insert({
      event_id: event.event_id,
      event_type: event.event_type,
      payload: event,
      status: 'processing'
      // processed_at only set when completed/failed
    });
  
  if (error && error.code === '23505') {
    // Unique constraint violation - event already exists
    console.log(`Event ${event.event_id} already exists`);
    return;
  }
}

async function markEventProcessed(eventId: string) {
  const supabase = getSupabaseAdminClient();
  await supabase
    .from('paddle_events')
    .update({ 
      processed: true, 
      status: 'completed',
      processed_at: new Date().toISOString() 
    })
    .eq('event_id', eventId);
}

async function markEventFailed(eventId: string, errorMessage: string) {
  const supabase = getSupabaseAdminClient();
  
  // Increment retry count
  const { data: event } = await supabase
    .from('paddle_events')
    .select('retry_count')
    .eq('event_id', eventId)
    .single();
  
  const retryCount = (event?.retry_count || 0) + 1;
  const maxRetries = 3;
  
  await supabase
    .from('paddle_events')
    .update({ 
      processed: false, 
      status: retryCount >= maxRetries ? 'failed' : 'pending',
      error_message: errorMessage,
      retry_count: retryCount,
      processed_at: new Date().toISOString() 
    })
    .eq('event_id', eventId);
}
```

### 2. Event Handlers

#### Subscription Created Handler
```typescript
async function handleSubscriptionCreated(event: any) {
  const supabase = getSupabaseAdminClient();
  const userId = event.data.custom_data.user_id;
  
  if (!userId) {
    console.error('No user_id in custom_data:', event.data);
    return;
  }
  
  await supabase
    .from('subscriptions')
    .update({
      paddle_subscription_id: event.data.id,
      paddle_customer_id: event.data.customer_id,
      plan_id: 'pro',
      status: 'active',
      current_period_start: event.data.current_billing_period.starts_at,
      current_period_end: event.data.current_billing_period.ends_at
    })
    .eq('user_id', userId);
  
  console.log(`User ${userId} upgraded to Pro plan`);
}
```

#### Subscription Cancelled Handler
```typescript
async function handleSubscriptionCancelled(event: any) {
  const supabase = getSupabaseAdminClient();
  
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('user_id, current_period_end')
    .eq('paddle_subscription_id', event.data.id)
    .single();
  
  if (!subscription) {
    console.error('Subscription not found for paddle_subscription_id:', event.data.id);
    return;
  }
  
  // Check if cancellation is effective now or scheduled
  const effectiveAt = event.data.scheduled_change?.effective_at;
  const now = new Date().toISOString();
  
  if (effectiveAt && effectiveAt > now) {
    // Scheduled cancellation
    await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancel_at: effectiveAt
      })
      .eq('paddle_subscription_id', event.data.id);
  } else {
    // Immediate cancellation - downgrade to Free
    await supabase
      .from('subscriptions')
      .update({
        plan_id: 'free',
        status: 'active',
        cancelled_at: new Date().toISOString(),
        current_period_end: null
      })
      .eq('paddle_subscription_id', event.data.id);
    
    // Handle project archiving for downgrade
    await handleDowngradeToFree(subscription.user_id);
  }
  
  console.log(`Subscription ${event.data.id} cancelled for user ${subscription.user_id}`);
}
```

#### Subscription Past Due Handler
```typescript
async function handleSubscriptionPastDue(event: any) {
  const supabase = getSupabaseAdminClient();
  
  await supabase
    .from('subscriptions')
    .update({ status: 'past_due' })
    .eq('paddle_subscription_id', event.data.id);
  
  // TODO: Send email notification to user
  console.log(`Subscription ${event.data.id} is past due`);
}
```

#### Transaction Completed Handler
```typescript
async function handleTransactionCompleted(event: any) {
  const supabase = getSupabaseAdminClient();
  
  // Update subscription period dates and clear grace period
  await supabase
    .from('subscriptions')
    .update({
      current_period_start: event.data.billing_period.starts_at,
      current_period_end: event.data.billing_period.ends_at,
      status: 'active',
      grace_start: null,
      grace_until: null
    })
    .eq('paddle_subscription_id', event.data.subscription_id);
  
  console.log(`Transaction completed for subscription ${event.data.subscription_id}`);
}
```

### 3. Downgrade Handler
Create `src/supabase/functions/server/downgrade-handler.ts`:

```typescript
import { getSupabaseAdminClient } from "./utils.ts";

export async function handleDowngradeToFree(userId: string) {
  const supabase = getSupabaseAdminClient();
  
  // Get all user's projects
  const { data: projects } = await supabase
    .from('projects')
    .select('id, created_at')
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('created_at', { ascending: true });
  
  if (projects.length <= 1) {
    // User has 1 or fewer projects, no action needed
    return;
  }
  
  // Keep the first project, archive the rest
  const projectsToArchive = projects.slice(1);
  
  await supabase
    .from('projects')
    .update({ is_archived: true })
    .in('id', projectsToArchive.map(p => p.id));
  
  // Send notification email
  await sendDowngradeNotification(userId, projectsToArchive.length);
  
  console.log(`User ${userId} downgraded. ${projectsToArchive.length} projects archived.`);
}

async function sendDowngradeNotification(userId: string, archivedCount: number) {
  const supabase = getSupabaseAdminClient();
  
  // Get user email
  const { data: user } = await supabase
    .from('users')
    .select('email')
    .eq('id', userId)
    .single();
  
  if (!user?.email) {
    console.error(`User email not found for user ${userId}`);
    return;
  }
  
  // Send downgrade notification email
  await sendEmail(user.email, 'downgrade_warning', {
    archived_count: archivedCount
  });
  
  console.log(`User ${userId} downgraded. ${archivedCount} projects archived.`);
}
```

### 4. Monthly Usage Reset
Create `src/supabase/functions/reset-monthly-usage/index.ts`:

```typescript
import { getSupabaseAdminClient } from "../server/utils.ts";

Deno.serve(async (req) => {
  const supabase = getSupabaseAdminClient();
  
  // Get all active subscriptions
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('status', 'active');
  
  if (!subscriptions || subscriptions.length === 0) {
    return new Response(JSON.stringify({ 
      success: true, 
      reset_count: 0,
      message: 'No active subscriptions found'
    }));
  }
  
  // Reset usage for each user (DATE consistency - JavaScript compatible)
  const now = new Date();
  const currentMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().slice(0, 10);
  
  for (const sub of subscriptions) {
    await supabase
      .from('usage_tracking')
      .upsert({
        user_id: sub.user_id,
        month: currentMonth,
        projects_created: 0,
        refreshes_used: 0
      }, {
        onConflict: 'user_id,month'
      });
  }
  
  return new Response(JSON.stringify({ 
    success: true,
    reset_count: subscriptions.length,
    month: currentMonth
  }));
});
```

### 5. Register Webhook Route
Update `src/supabase/functions/server/index.tsx`:

```typescript
import { setupPaddleWebhook } from "./paddle-webhook.ts";

// ... existing code ...

setupPaddleWebhook(app);
```

## Webhook Configuration

### Paddle Dashboard Setup
1. Go to Paddle Dashboard → Developer Tools → Notifications
2. Add Notification Destination
3. URL: `https://[your-project].supabase.co/functions/v1/make-server-cf9a9609/paddle-webhook`
4. Events to subscribe:
   - subscription.created
   - subscription.updated
   - subscription.cancelled
   - transaction.completed
   - subscription.past_due
5. Copy Webhook Secret

### Environment Variables
Add to Supabase Edge Function secrets:
```bash
PADDLE_WEBHOOK_SECRET=pdl_ntfset_xxxxxxxxxxxx
```

### Cron Job Setup
Configure in Supabase Dashboard:
- Function: `reset-monthly-usage`
- Schedule: `0 0 1 * *` (1st of month, midnight UTC)

## Files to Create/Modify

- `src/supabase/functions/server/paddle-webhook.ts` - Main webhook handler
- `src/supabase/functions/server/downgrade-handler.ts` - Downgrade logic
- `src/supabase/functions/reset-monthly-usage/index.ts` - Monthly reset
- `src/supabase/functions/server/index.tsx` - Register webhook route

## Timeline

- Webhook handler: 1 day
- Event handlers: 1 day
- Downgrade logic: 0.5 day
- Monthly reset: 0.5 day
- Testing: 1 day
- **Total: 4 days**

## Dependencies

- Database schema must be created
- Paddle webhook secret must be configured
- Supabase Edge Functions must be deployed
