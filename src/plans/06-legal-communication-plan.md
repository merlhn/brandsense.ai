# Legal & Communication Plan - Paddle Integration

## Overview
Legal document updates, email templates, and communication system implementation for Paddle payment integration.

## Goal
Update legal documents, create email templates, and implement automated communication system for subscription management.

## Legal Documents

### 1. Terms of Service Update
Update `src/components/TermsOfService.tsx`:

```typescript
// Add new section after existing content
const TermsOfService = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Existing terms content */}
      
      {/* NEW SECTION 7: Subscription and Billing */}
      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-4">7. Subscription and Billing</h2>
        
        <h3 className="text-xl font-semibold mb-3">7.1 Subscription Plans</h3>
        <p className="mb-4">
          BrandSense offers two subscription plans:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Free Plan:</strong> 1 project, 20 data refreshes per month, Keyword Analysis dashboard, Email support (48 hours)</li>
          <li><strong>Professional Plan:</strong> 10 projects, unlimited data refreshes, all dashboards (Keyword, Sentiment, Brand Identity), Priority support (24 hours)</li>
        </ul>
        
        <p className="mb-4 text-sm text-muted-foreground">
          <strong>Merchant of Record:</strong> Paddle acts as the merchant of record for all transactions. 
          Paddle handles payment processing, tax collection, and compliance on our behalf.
        </p>
        
        <p className="mb-4 text-sm text-muted-foreground">
          <strong>No Trial Period:</strong> Professional subscriptions start immediately upon payment. 
          No free trial period is offered. However, new subscribers have a 14-day money-back guarantee.
        </p>
        
        <p className="mb-4 text-sm text-muted-foreground">
          <strong>Taxes and Pricing:</strong> All prices are exclusive of taxes. Paddle calculates and adds 
          applicable taxes (VAT, sales tax) at checkout based on your location. For B2B customers, 
          please provide your VAT ID during checkout for tax-exempt processing.
        </p>

        <h3 className="text-xl font-semibold mb-3">7.2 Billing and Payment</h3>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Professional Plan is billed monthly at $9.99 USD or annually at $100 USD</li>
          <li>All payments are processed securely through Paddle, our payment processor</li>
          <li>Subscriptions automatically renew unless cancelled before the next billing period</li>
          <li>You will be charged in advance for each billing period</li>
          <li>All prices are exclusive of applicable taxes (VAT/taxes will be added at checkout)</li>
          <li>For B2B customers: Please provide your VAT ID during checkout for tax exemption</li>
        </ul>

        <h3 className="text-xl font-semibold mb-3">7.3 Cancellation and Refunds</h3>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>You may cancel your subscription at any time through your account settings</li>
          <li>Cancellation takes effect at the end of your current billing period</li>
          <li>No refunds are provided for partial months or unused portions of your subscription</li>
          <li>Upon cancellation, you will retain access to Professional features until the end of your billing period</li>
          <li>After cancellation, your account will be downgraded to the Free plan</li>
          <li><strong>EU/UK Right of Withdrawal:</strong> EU and UK customers have 14 days to withdraw from the contract starting from the day of subscription activation</li>
          <li><strong>Turkey Consumer Rights:</strong> Turkish customers have 14 days to withdraw from distance contracts</li>
        </ul>

        <h3 className="text-xl font-semibold mb-3">7.4 Plan Changes</h3>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>You may upgrade from Free to Professional at any time</li>
          <li>Upgrades take effect immediately upon successful payment</li>
          <li>Downgrades from Professional to Free take effect at the end of your current billing period</li>
          <li>If you have more than 1 project when downgrading, excess projects will be archived</li>
        </ul>

        <h3 className="text-xl font-semibold mb-3">7.5 Usage Limits</h3>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Free Plan users are limited to 1 project and 20 data refreshes per month</li>
          <li>Professional Plan users have access to 10 projects and unlimited data refreshes</li>
          <li>Usage limits reset on the 1st of each month</li>
          <li>Attempting to exceed limits will result in upgrade prompts</li>
        </ul>
      </section>
    </div>
  );
};
```

### 2. Privacy Policy Update
Update `src/components/PrivacyPolicy.tsx`:

```typescript
// Add new section after existing content
const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Existing privacy content */}
      
      {/* NEW SECTION: Payment Data Processing */}
      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Payment Data Processing</h2>
        
        <h3 className="text-xl font-semibold mb-3">Payment Processor</h3>
        <p className="mb-4">
          We use Paddle as our payment processor to handle subscription billing and payments. 
          Paddle is a PCI DSS compliant payment processor that securely processes your payment information.
        </p>

        <h3 className="text-xl font-semibold mb-3">Data We Collect</h3>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Payment method information (processed by Paddle, not stored by us)</li>
          <li>Billing address and contact information</li>
          <li>Subscription status and billing history</li>
          <li>Usage statistics for plan enforcement</li>
        </ul>

        <h3 className="text-xl font-semibold mb-3">How We Use Payment Data</h3>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Process subscription payments and renewals</li>
          <li>Enforce plan limits and feature access</li>
          <li>Provide billing and subscription management</li>
          <li>Send payment-related notifications</li>
        </ul>

        <h3 className="text-xl font-semibold mb-3">Data Sharing</h3>
        <p className="mb-4">
          We share necessary billing information with Paddle for payment processing. 
          We do not share your payment information with any other third parties.
        </p>

        <h3 className="text-xl font-semibold mb-3">Data Retention</h3>
        <p className="mb-4">
          We retain billing and subscription data for as long as your account is active 
          and for a reasonable period thereafter for legal and accounting purposes.
        </p>
      </section>
    </div>
  );
};
```

### 3. Refund Policy
Create `src/components/RefundPolicy.tsx`:

```typescript
const RefundPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Refund Policy</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-bold mb-4">Money-Back Guarantee</h2>
          <p className="mb-4">
            We offer a 14-day money-back guarantee for new Professional Plan subscribers. 
            If you are not satisfied with your subscription within the first 14 days, 
            you may request a full refund.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Refund Eligibility</h2>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Refunds are only available for new subscribers within 14 days of initial payment</li>
            <li>Refunds are not available for renewals or existing subscribers</li>
            <li>Refunds are not available for partial months or unused portions</li>
            <li>Refunds are not available for Free Plan users (no payment required)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">How to Request a Refund</h2>
          <ol className="list-decimal pl-6 mb-4 space-y-2">
            <li>Contact our support team at support@brandsense.digital</li>
            <li>Include your account email and subscription details</li>
            <li>Specify the reason for your refund request</li>
            <li>We will process your refund within 5-7 business days</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Refund Processing</h2>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Refunds are processed through Paddle, our payment processor</li>
            <li>Refunds will be credited to your original payment method</li>
            <li>Processing time depends on your bank or card issuer (typically 3-10 business days)</li>
            <li>Upon refund, your account will be downgraded to the Free Plan</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Cancellation vs Refund</h2>
          <p className="mb-4">
            <strong>Cancellation:</strong> Stops future billing but does not provide refunds for unused time.
            <br />
            <strong>Refund:</strong> Provides money back for recent payments (14-day guarantee only).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
          <p className="mb-4">
            For refund requests or questions about this policy, please contact:
            <br />
            Email: support@brandsense.digital
            <br />
            Response time: 24-48 hours
          </p>
        </section>
      </div>
    </div>
  );
};

export default RefundPolicy;
```

## Email Templates

### 4. Email Service Integration
Create `src/supabase/functions/server/email-service.ts`:

```typescript
interface EmailTemplate {
  subject: string;
  html: string;
}

export async function sendEmail(to: string, template: string, data: any) {
  const templates = {
    welcome_free: {
      subject: "Welcome to BrandSense - Your Free Plan is Active",
      html: renderWelcomeFreeTemplate(data)
    },
    upgrade_success: {
      subject: "Welcome to BrandSense Pro!",
      html: renderUpgradeSuccessTemplate(data)
    },
    subscription_cancelled: {
      subject: "Your BrandSense Pro subscription has been cancelled",
      html: renderSubscriptionCancelledTemplate(data)
    },
    payment_failed: {
      subject: "Payment Issue - Action Required",
      html: renderPaymentFailedTemplate(data)
    },
    downgrade_warning: {
      subject: "Your subscription will downgrade soon",
      html: renderDowngradeWarningTemplate(data)
    }
  };

  const templateData = templates[template];
  if (!templateData) {
    throw new Error(`Template ${template} not found`);
  }

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'BrandSense <noreply@brandsense.digital>',
      to,
      subject: templateData.subject,
      html: templateData.html
    })
  });
}

function renderWelcomeFreeTemplate(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to BrandSense</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #2563eb;">Welcome to BrandSense! 🎉</h1>
      
      <p>Your Free Plan is now active. Here's what you can do:</p>
      
      <ul>
        <li>Create 1 brand project</li>
        <li>Use 20 data refreshes per month</li>
        <li>Access Keyword Analysis dashboard</li>
        <li>Get email support within 48 hours</li>
      </ul>
      
      <p>Ready to get started? <a href="https://brandsense.digital/dashboard">Go to your dashboard</a></p>
      
      <p>Want more features? <a href="https://brandsense.digital/pricing">Upgrade to Pro</a> for unlimited projects and all dashboards.</p>
      
      <p>Best regards,<br>The BrandSense Team</p>
    </body>
    </html>
  `;
}

function renderUpgradeSuccessTemplate(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to BrandSense Pro</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #2563eb;">Welcome to BrandSense Pro! 🚀</h1>
      
      <p>Your Professional subscription is now active. You now have access to:</p>
      
      <ul>
        <li>Up to 10 brand projects</li>
        <li>Unlimited data refreshes</li>
        <li>All dashboards: Keyword, Sentiment, and Brand Identity</li>
        <li>Priority support within 24 hours</li>
      </ul>
      
      <p>Your next billing date: ${data.next_billing_date}</p>
      
      <p>Ready to explore? <a href="https://brandsense.digital/dashboard">Go to your dashboard</a></p>
      
      <p>Need help? <a href="https://brandsense.digital/support">Contact our support team</a></p>
      
      <p>Best regards,<br>The BrandSense Team</p>
    </body>
    </html>
  `;
}

function renderSubscriptionCancelledTemplate(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Subscription Cancelled</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #dc2626;">Your BrandSense Pro subscription has been cancelled</h1>
      
      <p>We're sorry to see you go! Your subscription will remain active until ${data.end_date}.</p>
      
      <p>After that date, your account will be downgraded to the Free Plan with these limitations:</p>
      
      <ul>
        <li>1 project maximum</li>
        <li>20 refreshes per month</li>
        <li>Keyword Analysis dashboard only</li>
      </ul>
      
      <p>If you have more than 1 project, excess projects will be archived but not deleted.</p>
      
      <p>Want to reactivate? <a href="https://brandsense.digital/pricing">Upgrade again anytime</a></p>
      
      <p>Questions? <a href="https://brandsense.digital/support">Contact our support team</a></p>
      
      <p>Best regards,<br>The BrandSense Team</p>
    </body>
    </html>
  `;
}

function renderPaymentFailedTemplate(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Issue - Action Required</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #dc2626;">Payment Issue - Action Required</h1>
      
      <p>We were unable to process your payment for your BrandSense Pro subscription.</p>
      
      <p>Please update your payment method to continue enjoying Pro features:</p>
      
      <p><a href="${data.portal_url}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Update Payment Method</a></p>
      
      <p>If payment is not updated by ${data.grace_period_end}, your account will be downgraded to the Free Plan.</p>
      
      <p>Need help? <a href="https://brandsense.digital/support">Contact our support team</a></p>
      
      <p>Best regards,<br>The BrandSense Team</p>
    </body>
    </html>
  `;
}

function renderDowngradeWarningTemplate(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Subscription Downgrade Warning</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #f59e0b;">Your subscription will downgrade soon</h1>
      
      <p>Your BrandSense Pro subscription will end on ${data.end_date} and your account will be downgraded to the Free Plan.</p>
      
      <p>This means you'll lose access to:</p>
      
      <ul>
        <li>Projects beyond your first one (will be archived)</li>
        <li>Unlimited data refreshes (limited to 20/month)</li>
        <li>Sentiment Analysis and Brand Identity dashboards</li>
        <li>Priority support</li>
      </ul>
      
      <p>Want to keep your Pro features? <a href="https://brandsense.digital/pricing">Renew your subscription</a></p>
      
      <p>Questions? <a href="https://brandsense.digital/support">Contact our support team</a></p>
      
      <p>Best regards,<br>The BrandSense Team</p>
    </body>
    </html>
  `;
}
```

### 5. Email Integration in Webhook Handler
Update webhook handlers to send emails:

```typescript
// In paddle-webhook.ts
import { sendEmail } from "./email-service.ts";

async function handleSubscriptionCreated(event: any) {
  // ... existing logic ...
  
  // Send welcome email
  await sendEmail(user.email, 'upgrade_success', {
    next_billing_date: event.data.current_billing_period.ends_at
  });
}

async function handleSubscriptionCancelled(event: any) {
  // ... existing logic ...
  
  // Send cancellation email
  await sendEmail(user.email, 'subscription_cancelled', {
    end_date: subscription.current_period_end
  });
}

async function handleSubscriptionPastDue(event: any) {
  // ... existing logic ...
  
  // Send payment failed email
  await sendEmail(user.email, 'payment_failed', {
    portal_url: `https://checkout.paddle.com/customer-portal/${event.data.customer_id}`,
    grace_period_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  });
}
```

## Files to Create/Modify

- `src/components/TermsOfService.tsx` - Add subscription terms
- `src/components/PrivacyPolicy.tsx` - Add payment data processing
- `src/components/RefundPolicy.tsx` - Create refund policy
- `src/supabase/functions/server/email-service.ts` - Email service
- `src/supabase/functions/server/paddle-webhook.ts` - Add email triggers

## Environment Variables

Add to Supabase Edge Function secrets:
```bash
RESEND_API_KEY=re_xxxxxxxxxxxx
```

## Timeline

- Legal document updates: 1 day
- Email templates: 1 day
- Email service integration: 1 day
- Webhook email triggers: 0.5 day
- Testing: 0.5 day
- **Total: 4 days**

## Dependencies

- Resend account setup for email service
- Webhook handler must be implemented
- Legal documents must be accessible in the app
