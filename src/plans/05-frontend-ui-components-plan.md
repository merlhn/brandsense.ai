# Frontend UI Components Plan - Paddle Integration

## Overview
Frontend UI components implementation for subscription management, paywalls, billing page, and user experience enhancements.

## Goal
Create user-friendly components for plan management, usage tracking, upgrade flows, and billing management.

## UI Components

### 1. Plan Limit Modal
Create `src/components/PlanLimitModal.tsx`:

```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Check, X } from "lucide-react";

interface PlanLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: 'projects' | 'refreshes';
  currentUsage: number;
  maxLimit: number;
  onUpgrade: () => void;
}

export function PlanLimitModal({ 
  isOpen, onClose, limitType, currentUsage, maxLimit, onUpgrade 
}: PlanLimitModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            You've Reached Your Free Plan Limit
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-muted-foreground mb-6">
            {limitType === 'projects' 
              ? `You've used ${currentUsage}/${maxLimit} project(s) on the Free plan.`
              : `You've used ${currentUsage}/${maxLimit} refreshes this month.`}
          </p>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Free Plan */}
            <div className="p-6 border rounded-lg">
              <h4 className="text-lg font-semibold mb-4">Free</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm">1 project</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm">20 refreshes/month</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm">Keyword Analysis</span>
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                $0/month
              </div>
            </div>
            
            {/* Pro Plan */}
            <div className="p-6 border-2 border-primary rounded-lg bg-primary/5">
              <h4 className="text-lg font-semibold mb-4 text-primary">Professional</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-0.5" />
                  <span className="text-sm font-medium">10 projects</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-0.5" />
                  <span className="text-sm font-medium">Unlimited refreshes</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-0.5" />
                  <span className="text-sm font-medium">All dashboards</span>
                </div>
              </div>
              <div className="mt-4 text-sm font-medium">
                $9.99/month
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Maybe Later
          </Button>
          <Button onClick={onUpgrade} size="lg">
            Upgrade to Pro - $9.99/month
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### 2. Dashboard Paywall
Create `src/components/DashboardPaywall.tsx`:

```typescript
import { Lock } from "lucide-react";
import { Button } from "./ui/button";

interface DashboardPaywallProps {
  dashboardName: string;
  onUpgrade: () => void;
}

export function DashboardPaywall({ dashboardName, onUpgrade }: DashboardPaywallProps) {
  return (
    <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-10 flex items-center justify-center">
      <div className="text-center p-8 max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-2xl font-semibold mb-3">
          {dashboardName} is a Pro Feature
        </h3>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          Upgrade to Professional to unlock {dashboardName.toLowerCase()}, 
          unlimited refreshes, and up to 10 brand projects.
        </p>
          <Button onClick={onUpgrade} size="lg" className="w-full">
            Upgrade to Pro - $9.99/month
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            No trial period - immediate access to Pro features
          </p>
        <p className="text-xs text-muted-foreground mt-4">
          Cancel anytime. No long-term contracts.
        </p>
      </div>
    </div>
  );
}
```

### 3. Billing Settings Page
Create `src/components/BillingSettings.tsx`:

```typescript
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { CreditCard, Calendar, Download } from "lucide-react";
import { getCurrentSubscription, cancelSubscription, getPortalUrl, createCheckoutSession } from "../lib/subscription-api";
import { openPaddlePortal } from "../lib/paddle-client";
import { Subscription, UsageStats } from "../lib/types";

export function BillingSettings() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      const data = await getCurrentSubscription();
      setSubscription(data.subscription);
      setUsage(data.usage);
    } catch (error) {
      console.error('Failed to load subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      const { checkout_url } = await createCheckoutSession('monthly');
      window.open(checkout_url, '_blank');
    } catch (error) {
      console.error('Failed to create checkout:', error);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { portal_url } = await getPortalUrl();
      window.open(portal_url, '_blank');
    } catch (error) {
      console.error('Failed to open portal:', error);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to Pro features at the end of your billing period.')) {
      return;
    }

    setCancelling(true);
    try {
      await cancelSubscription();
      await loadSubscriptionData();
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading subscription data...</div>;
  }

  if (!subscription) {
    return <div className="p-6">Failed to load subscription data.</div>;
  }

  const isPro = subscription.plan_id === 'pro';
  const usagePercentage = usage ? (usage.projects_created / usage.limits.max_projects) * 100 : 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Billing & Subscription</h2>
        <p className="text-muted-foreground">Manage your subscription and billing information.</p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold">{subscription.plan.name}</h3>
              <p className="text-muted-foreground">
                {isPro ? '$9.99/month' : 'Free'}
              </p>
            </div>
            <Badge variant={isPro ? 'default' : 'secondary'}>
              {subscription.status}
            </Badge>
          </div>

          {isPro ? (
            <div className="space-y-2">
              <Button onClick={handleManageSubscription} variant="outline">
                Manage Subscription
              </Button>
              <Button 
                onClick={handleCancelSubscription} 
                variant="destructive" 
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
              </Button>
            </div>
          ) : (
        <Button onClick={handleUpgrade}>
          {isPro ? 'Manage Subscription' : 'Upgrade to Pro - $9.99/month'}
        </Button>
          )}
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Usage This Month</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Projects created</span>
              <span>{usage?.projects_created || 0}/{usage?.limits.max_projects || 1}</span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
          </div>

          {usage?.limits.max_refreshes && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Refreshes used</span>
                <span>{usage.refreshes_used}/{usage.limits.max_refreshes}</span>
              </div>
              <Progress 
                value={(usage.refreshes_used / usage.limits.max_refreshes) * 100} 
                className="h-2" 
              />
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            Usage resets on the 1st of each month
          </div>
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Free</h4>
              <ul className="text-sm space-y-1">
                <li>1 project</li>
                <li>20 refreshes/month</li>
                <li>Keyword Analysis</li>
                <li>Email support (48h)</li>
              </ul>
              <div className="mt-3 text-lg font-semibold">$0/month</div>
            </div>
            <div className="p-4 border-2 border-primary rounded-lg bg-primary/5">
              <h4 className="font-semibold mb-2 text-primary">Professional</h4>
              <ul className="text-sm space-y-1">
                <li>10 projects</li>
                <li>Unlimited refreshes</li>
                <li>All dashboards</li>
                <li>Priority support (24h)</li>
              </ul>
              <div className="mt-3 text-lg font-semibold">$9.99/month</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 4. Usage Indicators
Create `src/components/UsageIndicator.tsx`:

```typescript
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { AlertTriangle, Clock } from "lucide-react";

interface UsageIndicatorProps {
  current: number;
  limit: number | null;
  type: 'projects' | 'refreshes';
  className?: string;
  rateLimitInfo?: {
    remaining: number;
    resetTime: number;
  };
}

export function UsageIndicator({ 
  current, 
  limit, 
  type, 
  className, 
  rateLimitInfo 
}: UsageIndicatorProps) {
  if (limit === null) {
    return (
      <Badge variant="secondary" className={className}>
        Unlimited
      </Badge>
    );
  }

  const percentage = (current / limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  // Rate limiting warning
  const showRateLimit = rateLimitInfo && rateLimitInfo.remaining < 5;
  const resetTime = rateLimitInfo ? new Date(rateLimitInfo.resetTime) : null;

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm text-muted-foreground">
          {type === 'projects' ? 'Projects' : 'Refreshes'}
        </span>
        <Badge 
          variant={isAtLimit ? 'destructive' : isNearLimit ? 'secondary' : 'outline'}
        >
          {current}/{limit}
        </Badge>
        {showRateLimit && (
          <Badge variant="outline" className="text-orange-600">
            <Clock className="w-3 h-3 mr-1" />
            Rate limited
          </Badge>
        )}
      </div>
      <Progress 
        value={percentage} 
        className="h-1"
        // @ts-ignore
        data-variant={isAtLimit ? 'destructive' : isNearLimit ? 'secondary' : 'default'}
      />
      {showRateLimit && resetTime && (
        <p className="text-xs text-muted-foreground mt-1">
          Resets at {resetTime.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
```

### 5. Loading Components
Create `src/components/ui/loading-spinner.tsx`:

```typescript
export function LoadingSpinner({ size = 'default' }: { size?: 'sm' | 'default' | 'lg' }) {
  const sizeClass = {
    sm: 'w-4 h-4',
    default: 'w-8 h-8',
    lg: 'w-12 h-12'
  }[size];
  
  return (
    <div className={`${sizeClass} animate-spin rounded-full border-2 border-primary border-t-transparent`} />
  );
}
```

Create `src/components/ui/skeleton.tsx`:

```typescript
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-muted ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="p-6 border rounded-lg space-y-4">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}
```

### 6. Update Existing Components

#### Update Sidebar
Modify `src/components/layout/Sidebar.tsx`:

```typescript
// Add billing menu item
<button 
  onClick={() => setActiveItem('billing')}
  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
    activeItem === 'billing' 
      ? 'bg-primary text-primary-foreground' 
      : 'hover:bg-muted'
  }`}
>
  <CreditCard className="w-4 h-4" />
  Billing
</button>

// Add lock icons for premium dashboards
<button 
  onClick={() => setActiveItem('sentiment')}
  className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-muted"
>
  <BarChart3 className="w-4 h-4" />
  Sentiment Analysis
  {!hasAccessToSentiment && <Lock className="w-3 h-3 ml-auto" />}
</button>
```

#### Update CreateProject
Modify `src/components/CreateProject.tsx`:

```typescript
// Add usage indicator
<div className="mb-6">
  <UsageIndicator 
    current={usage?.projects_created || 0}
    limit={usage?.limits.max_projects || 1}
    type="projects"
  />
</div>

// Add limit check before creation
const handleCreateProject = async () => {
  const limitCheck = await checkCanCreateProject();
  if (!limitCheck.allowed) {
    setShowPlanLimitModal(true);
    return;
  }
  // ... existing creation logic
};
```

## Files to Create/Modify

- `src/components/PlanLimitModal.tsx` - Plan limit modal
- `src/components/DashboardPaywall.tsx` - Dashboard paywall overlay
- `src/components/BillingSettings.tsx` - Billing management page
- `src/components/UsageIndicator.tsx` - Usage display component
- `src/components/ui/loading-spinner.tsx` - Loading spinner
- `src/components/ui/skeleton.tsx` - Skeleton components
- `src/components/layout/Sidebar.tsx` - Add billing menu and locks
- `src/components/CreateProject.tsx` - Add usage indicators and limits

## Timeline

- Plan limit modal: 1 day
- Dashboard paywall: 0.5 day
- Billing settings page: 1.5 days
- Usage indicators: 0.5 day
- Loading components: 0.5 day
- Update existing components: 1 day
- Testing: 1 day
- **Total: 6 days**

## Dependencies

- Frontend types and API clients must be implemented
- Paddle SDK must be initialized
- Backend API routes must be working
