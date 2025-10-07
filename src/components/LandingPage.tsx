import { useState } from "react";
import { motion } from "motion/react";
import { 
  Sparkles, 
  MessageSquare, 
  BarChart3, 
  Shield, 
  Zap, 
  Globe,
  CheckCircle2,
  ArrowRight,
  Mail,
  TrendingUp,
  Target,
  Users,
  Quote,
  Circle,
  Check
} from "lucide-react";
import { Button } from "./ui/button";
import { BrandLogo } from "./BrandLogo";
import { SupportDialog } from "./SupportDialog";

interface LandingPageProps {
  onNavigate: (screen: string) => void;
}

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Analysis",
    description: "Leverage ChatGPT to understand how your brand is perceived across conversations. Get comprehensive insights into brand identity, sentiment patterns, and keyword associations in minutes."
  },
  {
    icon: MessageSquare,
    title: "Sentiment Tracking",
    description: "Monitor positive, neutral, and negative sentiment trends in real-time. Understand emotional associations and track how perception shifts over time with detailed analytics."
  },
  {
    icon: BarChart3,
    title: "Keyword Intelligence",
    description: "Discover what keywords and topics are associated with your brand. Identify trending themes, competitive positioning, and opportunities to strengthen brand messaging."
  },
  {
    icon: Shield,
    title: "Brand Identity Mapping",
    description: "Visualize your brand's core attributes and personality traits. Understand your Brand Power Metrics (BPM) and discover your brand's dominant archetype and unique positioning."
  },
  {
    icon: Zap,
    title: "Real-Time Updates",
    description: "Refresh your data anytime with unlimited analysis powered by ChatGPT. Stay current with evolving brand perception and market dynamics with on-demand insights."
  },
  {
    icon: Globe,
    title: "Multi-Market Support",
    description: "Analyze your brand across different markets and languages. Get localized insights for Turkey, USA, Europe, and global markets with culturally-aware analysis."
  }
];

const useCases = [
  "Monitor brand reputation in AI conversations",
  "Track competitor mentions and comparisons",
  "Identify emerging brand perception trends",
  "Detect potential PR risks early",
  "Optimize brand positioning strategy",
  "Measure brand awareness and visibility",
  "Discover untapped market opportunities"
];

const brandExamples = [
  {
    name: "Nike",
    market: "Global Sports & Lifestyle",
    challenge: "Understanding how AI positions Nike vs. competitors in athletic innovation discussions",
    insight: "Discovered strong association with 'Just Do It' empowerment messaging and innovation, but opportunity to strengthen sustainability narrative",
    metric: "87 BPM Score",
    icon: TrendingUp
  },
  {
    name: "Starbucks",
    market: "Coffee & Experience Retail",
    challenge: "Tracking brand perception shifts during expansion into new markets",
    insight: "Identified 'third place' concept as dominant theme, with opportunity to emphasize community and personalization",
    metric: "82 BPM Score",
    icon: Target
  },
  {
    name: "Tesla",
    market: "Electric Vehicles & Tech",
    challenge: "Monitoring sentiment around brand innovation vs. reliability concerns",
    insight: "Strong innovation scores (92) but detected emerging concerns about service quality - enabled proactive communication strategy",
    metric: "89 BPM Score",
    icon: Shield
  }
];

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Brand Strategy Director",
    company: "Fortune 500 Tech Company",
    content: "Brand Sense transformed how we understand our AI visibility. We discovered our brand was being associated with keywords we never anticipated - both opportunities and risks. The insights helped us refine our messaging strategy and improve our Brand Power score by 23 points in just 3 months.",
    avatar: "SM"
  },
  {
    name: "Marcus Chen",
    role: "Head of Marketing",
    company: "Global Consumer Brand",
    content: "As AI becomes the primary research tool for consumers, understanding how ChatGPT perceives our brand is critical. Brand Sense gives us real-time insights that traditional market research takes weeks to deliver. The sentiment tracking helped us catch a potential PR issue before it escalated.",
    avatar: "MC"
  },
  {
    name: "Elena Rodriguez",
    role: "Chief Marketing Officer",
    company: "E-commerce Startup",
    content: "We used Brand Sense to understand our positioning against established competitors. The keyword intelligence revealed we were strongest in 'innovation' but weak in 'trust' - allowing us to pivot our content strategy. Our brand visibility improved 40% in targeted AI conversations.",
    avatar: "ER"
  },
  {
    name: "James Thompson",
    role: "VP of Communications",
    company: "Financial Services Firm",
    content: "The Brand Identity Mapping feature is incredible. We discovered our brand archetype (The Sage) aligned perfectly with our strategy, but highlighted gaps in 'approachability'. This insight led to a complete messaging overhaul that increased positive sentiment by 31%.",
    avatar: "JT"
  },
  {
    name: "Priya Patel",
    role: "Digital Marketing Manager",
    company: "Sustainable Fashion Brand",
    content: "Brand Sense helped us validate our sustainability positioning in AI conversations. We found we were strongly associated with 'eco-friendly' and 'ethical fashion' - exactly what we wanted. The multi-market analysis showed us opportunities in Europe we hadn't considered.",
    avatar: "PP"
  }
];

export function LandingPage({ onNavigate }: LandingPageProps) {
  const [showSupportDialog, setShowSupportDialog] = useState(false);

  return (
    <div 
      className="min-h-screen bg-[#000000] text-[#EDEDED]"
      style={{ backgroundColor: '#000000', color: '#EDEDED', minHeight: '100vh' }}
    >
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#000000]/80 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <BrandLogo />
          
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setShowSupportDialog(true)}
              className="text-foreground hover:text-primary hover:bg-transparent"
            >
              <Mail className="w-4 h-4 mr-2" />
              Support
            </Button>
            <Button
              variant="outline"
              onClick={() => onNavigate("signin")}
              className="border-border text-foreground hover:bg-secondary"
            >
              Sign In
            </Button>
            <Button
              onClick={() => onNavigate("signup")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-primary tracking-tight" style={{ fontSize: '13px', fontWeight: 500 }}>Powered by GPT-4o</span>
            </div>
            
            <h1 className="text-foreground mb-6 tracking-tight" style={{ fontSize: '56px', lineHeight: '1.1', fontWeight: 600 }}>
              Monitor Your Brand Visibility
              <br />
              <span className="text-primary">in AI Conversations</span>
            </h1>
            
            <p className="text-muted-foreground mb-4 max-w-2xl mx-auto" style={{ fontSize: '20px', lineHeight: '1.6' }}>
              Understand how ChatGPT and AI models perceive your brand. Get actionable insights 
              on sentiment, identity, keywords, and brand positioning.
            </p>
            
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto" style={{ fontSize: '16px', lineHeight: '1.6' }}>
              As millions of people use AI assistants to research products, services, and brands, 
              your AI visibility determines whether you're part of the conversation or invisible. 
              Brand Sense helps you measure, understand, and improve how AI models represent your brand.
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={() => onNavigate("signup")}
                className="bg-primary hover:bg-primary/90 text-[rgba(255,255,255,1)] px-6 py-3"
              >
                Start Monitoring
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  document.getElementById('examples')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="border-border text-foreground hover:bg-secondary"
              >
                See Examples
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why It Matters Section */}
      <section className="py-20 px-6 border-t border-border/50 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-foreground mb-4 tracking-tight" style={{ fontSize: '40px', fontWeight: 600 }}>
              Why AI brand monitoring matters
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto" style={{ fontSize: '18px', lineHeight: '1.7' }}>
              The way consumers discover and research brands is fundamentally changing. Traditional search engines are being replaced by AI assistants that don't just index information—they interpret, synthesize, and recommend.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="p-6 rounded-lg bg-card border border-border"
            >
              <div className="w-12 h-12 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="text-foreground mb-3 tracking-tight" style={{ fontSize: '18px', fontWeight: 600 }}>
                The Problem
              </h3>
              <p className="text-muted-foreground mb-3" style={{ fontSize: '14px', lineHeight: '1.7' }}>
                When someone asks ChatGPT "What's the best coffee brand?" or "Which athletic shoe brand is most innovative?", you have zero visibility into:
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2.5 text-muted-foreground" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                  <Circle className="w-1.5 h-1.5 fill-destructive text-destructive shrink-0" />
                  <span>Whether your brand is mentioned at all</span>
                </li>
                <li className="flex items-center gap-2.5 text-muted-foreground" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                  <Circle className="w-1.5 h-1.5 fill-destructive text-destructive shrink-0" />
                  <span>How you're positioned vs. competitors</span>
                </li>
                <li className="flex items-center gap-2.5 text-muted-foreground" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                  <Circle className="w-1.5 h-1.5 fill-destructive text-destructive shrink-0" />
                  <span>What keywords trigger your brand mention</span>
                </li>
                <li className="flex items-center gap-2.5 text-muted-foreground" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                  <Circle className="w-1.5 h-1.5 fill-destructive text-destructive shrink-0" />
                  <span>Sentiment and perception patterns</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="p-6 rounded-lg bg-card border border-border"
            >
              <div className="w-12 h-12 rounded-lg bg-success/10 border border-success/20 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-foreground mb-3 tracking-tight" style={{ fontSize: '18px', fontWeight: 600 }}>
                The Solution
              </h3>
              <p className="text-muted-foreground mb-3" style={{ fontSize: '14px', lineHeight: '1.7' }}>
                Brand Sense analyzes exactly how AI models perceive and present your brand, giving you:
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2.5 text-muted-foreground" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                  <Check className="w-4 h-4 text-success shrink-0" />
                  <span>Comprehensive brand identity mapping</span>
                </li>
                <li className="flex items-center gap-2.5 text-muted-foreground" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                  <Check className="w-4 h-4 text-success shrink-0" />
                  <span>Real-time sentiment analysis across topics</span>
                </li>
                <li className="flex items-center gap-2.5 text-muted-foreground" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                  <Check className="w-4 h-4 text-success shrink-0" />
                  <span>Keyword association intelligence</span>
                </li>
                <li className="flex items-center gap-2.5 text-muted-foreground" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                  <Check className="w-4 h-4 text-success shrink-0" />
                  <span>Actionable insights for positioning strategy</span>
                </li>
              </ul>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 p-8 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 max-w-4xl mx-auto text-center"
          >
            <p className="text-foreground mb-4" style={{ fontSize: '20px', lineHeight: '1.6', fontWeight: 500 }}>
              "By 2025, over 60% of product research will start with AI assistants, not search engines."
            </p>
            <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
              If your brand isn't optimized for AI visibility, you're invisible to the next generation of consumers.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-foreground mb-4 tracking-tight" style={{ fontSize: '40px', fontWeight: 600 }}>
              Everything you need to monitor
              <br />
              your brand in AI
            </h2>
            <p className="text-muted-foreground" style={{ fontSize: '18px' }}>
              Comprehensive analytics and insights powered by GPT-4o
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-6 rounded-lg bg-card border border-border hover:border-primary/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-foreground mb-2 tracking-tight" style={{ fontSize: '18px', fontWeight: 600 }}>
                  {feature.title}
                </h3>
                <p className="text-muted-foreground" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-6 border-t border-border/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-primary tracking-tight" style={{ fontSize: '12px', fontWeight: 500 }}>AI-Native Analytics</span>
            </div>
            
            <h2 className="text-foreground mb-4 tracking-tight" style={{ fontSize: '36px', fontWeight: 600 }}>
              Built for modern brand teams
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto" style={{ fontSize: '16px', lineHeight: '1.6' }}>
              As AI becomes the primary way people discover and research brands, 
              understanding your AI visibility is critical. Brand Sense gives you the 
              insights you need to stay ahead in an AI-first world.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {useCases.map((useCase, index) => (
              <motion.div
                key={useCase}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                className="flex items-start gap-3 p-4 rounded-lg bg-card/50 border border-border/50 hover:border-primary/30 transition-colors"
              >
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-foreground tracking-tight" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                  {useCase}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Examples Section */}
      <section id="examples" className="py-20 px-6 border-t border-border/50 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-foreground mb-4 tracking-tight" style={{ fontSize: '40px', fontWeight: 600 }}>
              Real brands, real insights
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto" style={{ fontSize: '18px', lineHeight: '1.6' }}>
              See how leading brands use Brand Sense to understand their AI visibility and strengthen their positioning in AI-powered conversations
            </p>
          </motion.div>

          <div className="space-y-6">
            {brandExamples.map((brand, index) => (
              <motion.div
                key={brand.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-6 rounded-lg bg-card border border-border hover:border-primary/30 transition-all duration-300"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <brand.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-foreground tracking-tight" style={{ fontSize: '18px', fontWeight: 600 }}>
                          {brand.name}
                        </h3>
                        <p className="text-muted-foreground" style={{ fontSize: '13px' }}>
                          {brand.market}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="lg:col-span-9 space-y-3">
                    <div>
                      <p className="text-muted-foreground mb-1" style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Challenge
                      </p>
                      <p className="text-foreground" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                        {brand.challenge}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-muted-foreground mb-1" style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Key Insight
                      </p>
                      <p className="text-foreground" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                        {brand.insight}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 pt-2">
                      <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                        <span className="text-primary tracking-tight" style={{ fontSize: '13px', fontWeight: 600 }}>
                          {brand.metric}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-foreground mb-4 tracking-tight" style={{ fontSize: '40px', fontWeight: 600 }}>
              Trusted by marketing leaders
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto" style={{ fontSize: '18px', lineHeight: '1.6' }}>
              Marketing professionals around the world rely on Brand Sense to understand and improve their brand's AI visibility
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-6 rounded-lg bg-card border border-border hover:border-primary/30 transition-all duration-300"
              >
                <Quote className="w-8 h-8 text-primary/30 mb-4" />
                
                <p className="text-foreground mb-6" style={{ fontSize: '14px', lineHeight: '1.7' }}>
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-primary tracking-tight" style={{ fontSize: '13px', fontWeight: 600 }}>
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div>
                    <p className="text-foreground tracking-tight" style={{ fontSize: '14px', fontWeight: 600 }}>
                      {testimonial.name}
                    </p>
                    <p className="text-muted-foreground" style={{ fontSize: '12px' }}>
                      {testimonial.role}
                    </p>
                    <p className="text-muted-foreground" style={{ fontSize: '11px' }}>
                      {testimonial.company}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 border-t border-border/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-foreground mb-4 tracking-tight" style={{ fontSize: '40px', fontWeight: 600 }}>
              Start monitoring your brand today
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto" style={{ fontSize: '18px', lineHeight: '1.6' }}>
              Join marketing leaders who are already using Brand Sense to understand and improve their AI visibility. Get your first brand analysis in minutes.
            </p>
            
            <div className="flex items-center justify-center gap-4 mb-12">
              <Button
                onClick={() => onNavigate("signup")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSupportDialog(true)}
                className="border-border text-foreground hover:bg-secondary"
              >
                <Mail className="w-4 h-4 mr-2" />
                Contact Sales
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-border/30">
              <div className="text-center">
                <CheckCircle2 className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-foreground tracking-tight" style={{ fontSize: '14px', fontWeight: 500 }}>
                  No credit card required
                </p>
                <p className="text-muted-foreground" style={{ fontSize: '12px' }}>
                  Start analyzing immediately
                </p>
              </div>
              <div className="text-center">
                <CheckCircle2 className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-foreground tracking-tight" style={{ fontSize: '14px', fontWeight: 500 }}>
                  2-3 minute analysis
                </p>
                <p className="text-muted-foreground" style={{ fontSize: '12px' }}>
                  Get instant insights
                </p>
              </div>
              <div className="text-center">
                <CheckCircle2 className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-foreground tracking-tight" style={{ fontSize: '14px', fontWeight: 500 }}>
                  Unlimited refreshes
                </p>
                <p className="text-muted-foreground" style={{ fontSize: '12px' }}>
                  Stay always current
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <BrandLogo />
            </div>
            
            <p className="text-muted-foreground tracking-tight" style={{ fontSize: '14px' }}>
              Brand Sense © 2025 · Powered by ChatGPT
            </p>
            
            <button 
              onClick={() => setShowSupportDialog(true)}
              className="text-muted-foreground hover:text-primary transition-colors" 
              style={{ fontSize: '14px' }}
            >
              Support
            </button>
          </div>
        </div>
      </footer>

      {/* Support Dialog */}
      <SupportDialog 
        open={showSupportDialog} 
        onOpenChange={setShowSupportDialog}
      />
    </div>
  );
}
