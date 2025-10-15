import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { BrandLogo } from "./BrandLogo";

interface RefundPolicyProps {
  onNavigate: (screen: string) => void;
}

export function RefundPolicy({ onNavigate }: RefundPolicyProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('landing')}
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Button>
            </div>
            <BrandLogo />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Refund Policy</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              This Refund Policy outlines the terms and conditions for refunds on BrandSense services.
            </p>
            <p className="text-sm text-muted-foreground">
              Last updated: January 8, 2025
            </p>
          </div>

          {/* Refund Content */}
          <div className="prose prose-lg max-w-none space-y-8">
            
            {/* 1. General Policy */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                1. General Refund Policy
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  BrandSense is currently offered as a free service. As such, no refunds are applicable at this time since no charges are made for the use of our platform.
                </p>
                <p>
                  In the event that we introduce paid features or subscription plans in the future, this refund policy will be updated accordingly and users will be notified of any changes with at least 30 days notice.
                </p>
              </div>
            </section>

            {/* 2. Future Paid Services */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                2. Future Paid Services
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Should BrandSense introduce paid features or subscription plans in the future, the following refund terms will apply:
                </p>
                <h3 className="text-lg font-medium text-foreground mt-6 mb-3">Subscription Refunds</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Monthly subscriptions may be cancelled at any time with no refund for the current billing period</li>
                  <li>Annual subscriptions may be eligible for a prorated refund if cancelled within the first 30 days</li>
                  <li>Refunds will be processed within 5-10 business days of approval</li>
                </ul>
                <h3 className="text-lg font-medium text-foreground mt-6 mb-3">One-Time Purchases</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>One-time feature purchases may be refunded within 14 days of purchase</li>
                  <li>Refunds are not available for services that have been substantially used</li>
                  <li>Digital products are generally non-refundable once delivered</li>
                </ul>
              </div>
            </section>

            {/* 3. Refund Eligibility */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                3. Refund Eligibility
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  To be eligible for a refund, the following conditions must be met:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Refund request must be submitted within the specified time frame</li>
                  <li>Service must not have been substantially used or consumed</li>
                  <li>No violation of our Terms of Service must have occurred</li>
                  <li>Refund request must be made through the proper channels</li>
                </ul>
                <p>
                  We reserve the right to deny refund requests that do not meet these eligibility criteria.
                </p>
              </div>
            </section>

            {/* 4. Non-Refundable Items */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                4. Non-Refundable Items
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  The following items and services are generally non-refundable:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Services that have been substantially used or consumed</li>
                  <li>Custom analysis reports that have been generated and delivered</li>
                  <li>AI processing credits that have been utilized</li>
                  <li>Third-party service fees or charges</li>
                  <li>Services terminated due to Terms of Service violations</li>
                </ul>
              </div>
            </section>

            {/* 5. Processing Time */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                5. Refund Processing Time
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Once a refund request is approved, processing times are as follows:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Credit card refunds: 5-10 business days</li>
                  <li>PayPal refunds: 3-5 business days</li>
                  <li>Bank transfers: 7-14 business days</li>
                  <li>Cryptocurrency refunds: 1-3 business days</li>
                </ul>
                <p>
                  Processing times may vary depending on your financial institution and payment method.
                </p>
              </div>
            </section>

            {/* 6. How to Request a Refund */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                6. How to Request a Refund
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  To request a refund, please follow these steps:
                </p>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Contact us at omerlhn@gmail.com with your refund request</li>
                  <li>Include your account information and order details</li>
                  <li>Provide a reason for the refund request</li>
                  <li>Wait for our response and approval</li>
                  <li>Receive confirmation of the refund processing</li>
                </ol>
                <p>
                  We will review your request and respond within 2-3 business days.
                </p>
              </div>
            </section>

            {/* 7. Disputes and Chargebacks */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                7. Disputes and Chargebacks
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  If you initiate a chargeback or dispute with your payment provider, we may:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Suspend your account until the dispute is resolved</li>
                  <li>Provide evidence to support the original transaction</li>
                  <li>Work with your payment provider to resolve the issue</li>
                  <li>Permanently close your account if the dispute is found to be fraudulent</li>
                </ul>
                <p>
                  We encourage you to contact us directly before initiating a chargeback to resolve any issues.
                </p>
              </div>
            </section>

            {/* 8. Service Interruptions */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                8. Service Interruptions
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  In the event of service interruptions or technical issues:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>We will work to restore service as quickly as possible</li>
                  <li>No refunds will be provided for temporary service interruptions</li>
                  <li>Extended outages may result in service credits or extensions</li>
                  <li>We will communicate any significant service issues to affected users</li>
                </ul>
              </div>
            </section>

            {/* 9. Changes to Refund Policy */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                9. Changes to This Refund Policy
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We reserve the right to modify this Refund Policy at any time. Changes will be communicated to users through:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Email notifications to registered users</li>
                  <li>In-app notifications and announcements</li>
                  <li>Updates to this policy page</li>
                  <li>Social media announcements for significant changes</li>
                </ul>
                <p>
                  Continued use of our service after policy changes constitutes acceptance of the updated terms.
                </p>
              </div>
            </section>

            {/* 10. Contact Information */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  For refund requests or questions about this policy, please contact us:
                </p>
                <div className="bg-card p-6 rounded-lg border">
                  <p><strong>Email:</strong> omerlhn@gmail.com</p>
                  <p><strong>Subject Line:</strong> Refund Request - [Your Account Email]</p>
                  <p><strong>Response Time:</strong> 2-3 business days</p>
                  <p><strong>Support:</strong> Available through the in-app support system</p>
                </div>
              </div>
            </section>

          </div>

          {/* Footer Actions */}
          <div className="flex justify-center pt-8 border-t">
            <Button 
              onClick={() => onNavigate('landing')}
              variant="outline"
              className="px-8"
            >
              Back to Home
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
