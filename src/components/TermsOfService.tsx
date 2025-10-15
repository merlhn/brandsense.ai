import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { BrandLogo } from "./BrandLogo";

interface TermsOfServiceProps {
  onNavigate: (screen: string) => void;
}

export function TermsOfService({ onNavigate }: TermsOfServiceProps) {
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
            <h1 className="text-4xl font-bold">Terms of Service</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Please read these terms carefully before using BrandSense. By using our service, you agree to be bound by these terms.
            </p>
            <p className="text-sm text-muted-foreground">
              Last updated: January 8, 2025
            </p>
          </div>

          {/* Terms Content */}
          <div className="prose prose-lg max-w-none space-y-8">
            
            {/* 1. Acceptance of Terms */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                1. Acceptance of Terms
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  By accessing and using BrandSense ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
                <p>
                  These Terms of Service ("Terms") govern your use of our website and services operated by BrandSense ("us", "we", or "our").
                </p>
              </div>
            </section>

            {/* 2. Description of Service */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  BrandSense is an AI-powered brand monitoring and analysis platform that provides:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Brand identity analysis using artificial intelligence</li>
                  <li>Sentiment tracking and analysis</li>
                  <li>Keyword intelligence and monitoring</li>
                  <li>Brand risk reporting and insights</li>
                  <li>Multi-market brand perception analysis</li>
                </ul>
                <p>
                  The Service is provided "as is" and we reserve the right to modify, suspend, or discontinue the Service at any time without notice.
                </p>
              </div>
            </section>

            {/* 3. User Accounts */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                3. User Accounts
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  To access certain features of the Service, you must register for an account. You agree to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide accurate, current, and complete information during registration</li>
                  <li>Maintain and update your account information</li>
                  <li>Maintain the security of your password and account</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                </ul>
                <p>
                  You may invite one additional user to your workspace. Both users will have equal administrative rights within the workspace.
                </p>
              </div>
            </section>

            {/* 4. Acceptable Use */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>You agree not to use the Service to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Violate any laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Transmit harmful or malicious code</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Use the Service for any illegal or unauthorized purpose</li>
                  <li>Interfere with or disrupt the Service or servers</li>
                  <li>Create multiple accounts to circumvent usage limits</li>
                </ul>
              </div>
            </section>

            {/* 5. Data and Privacy */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Data and Privacy</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We collect and process data as described in our Privacy Policy. By using the Service, you consent to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Collection of your brand information for analysis purposes</li>
                  <li>Processing of data through AI models to generate insights</li>
                  <li>Storage of your analysis results and project data</li>
                  <li>Sharing of data within your workspace (if applicable)</li>
                </ul>
                <p>
                  You retain ownership of your brand data. We use it solely to provide the Service and will not sell your data to third parties.
                </p>
              </div>
            </section>

            {/* 6. Intellectual Property */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  The Service and its original content, features, and functionality are owned by BrandSense and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                </p>
                <p>
                  You may not copy, modify, distribute, sell, or lease any part of our Service or included software, nor may you reverse engineer or attempt to extract the source code of that software.
                </p>
              </div>
            </section>

            {/* 7. Payment and Billing */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Payment and Billing</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Currently, BrandSense is offered as a free service. We reserve the right to introduce paid features or subscription plans in the future. Any changes to pricing will be communicated with at least 30 days notice.
                </p>
                <p>
                  If payment is required in the future, you agree to pay all fees and charges associated with your account according to the pricing terms in effect at the time.
                </p>
              </div>
            </section>

            {/* 8. Termination */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Termination</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We may terminate or suspend your account and access to the Service immediately, without prior notice, for any reason, including breach of these Terms.
                </p>
                <p>
                  You may terminate your account at any time by contacting us. Upon termination, your right to use the Service will cease immediately.
                </p>
              </div>
            </section>

            {/* 9. Disclaimers */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                9. Disclaimers
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                </p>
                <p>
                  We do not warrant that the Service will be uninterrupted, error-free, or free of viruses or other harmful components. The AI-generated insights are for informational purposes only and should not be the sole basis for business decisions.
                </p>
              </div>
            </section>

            {/* 10. Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Limitation of Liability</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  IN NO EVENT SHALL BRANDSENSE BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF THE SERVICE.
                </p>
                <p>
                  Our total liability to you for all damages shall not exceed the amount you paid us for the Service in the 12 months preceding the claim.
                </p>
              </div>
            </section>

            {/* 11. Governing Law */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Governing Law</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of Turkey, without regard to its conflict of law provisions.
                </p>
                <p>
                  Any disputes arising from these Terms or your use of the Service shall be resolved in the courts of Turkey.
                </p>
              </div>
            </section>

            {/* 12. Changes to Terms */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Changes to Terms</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We reserve the right to modify these Terms at any time. We will notify users of any material changes by email or through the Service.
                </p>
                <p>
                  Your continued use of the Service after such modifications constitutes acceptance of the updated Terms.
                </p>
              </div>
            </section>

            {/* 13. Contact Information */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className="bg-card p-6 rounded-lg border">
                  <p><strong>Email:</strong> omerlhn@gmail.com</p>
                  <p><strong>Website:</strong> https://brandsense.digital</p>
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
