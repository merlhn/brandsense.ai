import { useState, lazy, Suspense } from "react";
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
  Circle,
  Check,
  TrendingDown,
  Minus,
  Heart,
  Info
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


export function LandingPage({ onNavigate }: LandingPageProps) {
  const [showSupportDialog, setShowSupportDialog] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div 
      className="min-h-screen bg-[#000000] text-[#EDEDED]"
      style={{ backgroundColor: '#000000', color: '#EDEDED', minHeight: '100vh' }}
    >
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#000000]/80 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <BrandLogo />
          
          <div className="flex items-center gap-6">
            {/* Navigation Menu */}
            <nav className="hidden md:flex items-center space-x-6">
              <button 
                onClick={() => scrollToSection('hero')}
                className="text-foreground hover:text-primary transition-colors"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('features')}
                className="text-foreground hover:text-primary transition-colors"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('pricing')}
                className="text-foreground hover:text-primary transition-colors"
              >
                Pricing
              </button>
              <button 
                onClick={() => scrollToSection('faq')}
                className="text-foreground hover:text-primary transition-colors"
              >
                FAQ
              </button>
            </nav>

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
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 w-fit">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-primary tracking-tight" style={{ fontSize: '13px', fontWeight: 500 }}>Powered by GPT-4o</span>
                </div>
              </div>
              
              <h1 className="text-foreground tracking-tight" style={{ fontSize: '56px', lineHeight: '1.1', fontWeight: 600 }}>
                Monitor Your Brand Visibility
                <br />
                <span className="text-primary">in AI Conversations</span>
              </h1>
              
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Understand how ChatGPT and AI models perceive your brand. Get actionable insights 
                on sentiment, identity, keywords, and brand positioning.
              </p>
              
              <p className="text-muted-foreground max-w-2xl mx-auto">
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
            </div>
          </motion.div>
        </div>
      </section>


      {/* Features Grid */}
      <section id="features" className="py-20 px-6 border-t border-border/50">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group p-6 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <feature.icon className="w-7 h-7 text-primary group-hover:text-primary/80" />
                </div>
                <h3 className="text-foreground mb-3 tracking-tight group-hover:text-primary transition-colors duration-300" style={{ fontSize: '20px', fontWeight: 600 }}>
                  {feature.title}
                </h3>
                <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300 mb-4" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                  {feature.description}
                </p>
                
                {/* Mini Dashboard Preview */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-card/50 rounded-lg p-3 border border-border/30">
                    {feature.title === "AI-Powered Analysis" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">BPM Score</span>
                          <span className="text-xs font-bold text-primary">87</span>
                        </div>
                        <div className="w-full bg-muted/30 rounded-full h-1">
                          <div className="bg-primary h-1 rounded-full" style={{ width: '87%' }}></div>
                        </div>
                      </div>
                    )}
                    
                    {feature.title === "Sentiment Tracking" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-foreground">Positive</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-muted rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                            </div>
                            <span className="text-xs font-bold text-green-500">40/100</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-foreground">Neutral</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-muted rounded-full h-2">
                              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                            </div>
                            <span className="text-xs font-bold text-blue-500">30/100</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-foreground">Negative</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-muted rounded-full h-2">
                              <div className="bg-red-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                            </div>
                            <span className="text-xs font-bold text-red-500">20/100</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {feature.title === "Keyword Intelligence" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Top Keywords</span>
                          <span className="text-xs font-bold text-primary">92% Visibility</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-foreground">Pegasus</span>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3 text-green-500" />
                              <span className="text-xs text-green-500">92%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-foreground">Jordan</span>
                            <div className="flex items-center gap-1">
                              <Minus className="w-3 h-3 text-yellow-500" />
                              <span className="text-xs text-yellow-500">86%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-foreground">Air Max</span>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3 text-green-500" />
                              <span className="text-xs text-green-500">85%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {feature.title === "Brand Identity Mapping" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Visibility</span>
                          <span className="text-xs font-bold text-foreground">86</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Distinctiveness</span>
                          <span className="text-xs font-bold text-foreground">84</span>
                        </div>
                      </div>
                    )}
                    
                    {feature.title === "Real-Time Updates" && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs text-muted-foreground">Live Analysis</span>
                      </div>
                    )}
                    
                    {feature.title === "Multi-Market Support" && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <span className="text-xs text-muted-foreground">Global Markets</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-full h-1 bg-gradient-to-r from-primary/20 to-primary/60 rounded-full"></div>
                </div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brandExamples.map((brand, index) => (
              <motion.div
                key={brand.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group p-6 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    <brand.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-foreground tracking-tight group-hover:text-primary transition-colors duration-300" style={{ fontSize: '20px', fontWeight: 600 }}>
                      {brand.name}
                    </h3>
                    <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
                      {brand.market}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wider">
                      Challenge
                    </p>
                    <p className="text-foreground text-sm leading-relaxed">
                      {brand.challenge}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wider">
                      Key Insight
                    </p>
                    <p className="text-foreground text-sm leading-relaxed">
                      {brand.insight}
                    </p>
                  </div>
                  
                  {/* Mini Dashboard Preview */}
                  <div className="mt-4 p-3 bg-card/30 rounded-lg border border-border/30">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-foreground">
                          {brand.name === 'Nike' ? '86' : brand.name === 'Starbucks' ? '82' : '89'}
                        </div>
                        <div className="text-xs text-muted-foreground">BPM Score</div>
                      </div>
                      <div className="text-center">
                    <div className="text-lg font-bold text-foreground">
                      {brand.name === 'Nike' ? '40/100' : brand.name === 'Starbucks' ? '45/100' : '38/100'}
                    </div>
                    <div className="text-xs text-muted-foreground">Positive</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {brand.name === 'Nike' && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-foreground">Pegasus</span>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3 text-green-500" />
                              <span className="text-xs text-green-500">92%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-foreground">Jordan</span>
                            <div className="flex items-center gap-1">
                              <Minus className="w-3 h-3 text-yellow-500" />
                              <span className="text-xs text-yellow-500">86%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-foreground">Air Max</span>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3 text-green-500" />
                              <span className="text-xs text-green-500">85%</span>
                            </div>
                          </div>
                        </>
                      )}
                      {brand.name === 'Starbucks' && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-foreground">Coffee Culture</span>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3 text-green-500" />
                              <span className="text-xs text-green-500">88%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-foreground">Third Place</span>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3 text-green-500" />
                              <span className="text-xs text-green-500">84%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-foreground">Premium</span>
                            <div className="flex items-center gap-1">
                              <Minus className="w-3 h-3 text-yellow-500" />
                              <span className="text-xs text-yellow-500">79%</span>
                            </div>
                          </div>
                        </>
                      )}
                      {brand.name === 'Tesla' && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-foreground">Electric</span>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3 text-green-500" />
                              <span className="text-xs text-green-500">91%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-foreground">Innovation</span>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3 text-green-500" />
                              <span className="text-xs text-green-500">89%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-foreground">Autopilot</span>
                            <div className="flex items-center gap-1">
                              <TrendingDown className="w-3 h-3 text-red-500" />
                              <span className="text-xs text-red-500">76%</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center pt-4 border-t border-border/50">
                    <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                      <span className="text-primary font-semibold text-sm">
                        {brand.metric}
                      </span>
                    </div>
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

          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Choose Your Plan
            </h2>
            
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Start monitoring your brand's AI visibility today. 
              No hidden fees, no long-term contracts.
            </p>
          </motion.div>

          {/* Pricing Toggle */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center bg-card rounded-lg p-1 border border-border">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  !isAnnual 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isAnnual 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Annual
                <span className="ml-1 px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">
                  Save 17%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Starter Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl bg-card border-2 border-border hover:border-primary/20 transition-colors"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">Starter</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-foreground">Free</span>
                </div>
                <p className="text-muted-foreground">Perfect for individuals and small businesses</p>
              </div>

              <div className="space-y-4 mb-6">
                {[
                  "Single Brand Monitoring",
                  "Limited data refresh",
                  "Single Market Analysis for Brand"
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                    <span className="text-foreground text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Dashboards Section */}
              <div className="border-t border-border/30 pt-4 mb-6">
                <h4 className="text-sm font-medium text-foreground mb-3">Dashboards</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                    <span className="text-foreground text-sm">Keyword Analysis</span>
                  </div>
                </div>
              </div>

              {/* Settings & Support Section */}
              <div className="border-t border-border/30 pt-4 mb-6">
                <h4 className="text-sm font-medium text-foreground mb-3">Settings & Support</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                    <span className="text-foreground text-sm">Email Support in 48h</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                    <span className="text-foreground text-sm">1 seat in workspace</span>
                  </div>
                </div>
              </div>

              <Button
                className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                onClick={() => onNavigate('signup')}
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>

            {/* Professional Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative p-8 rounded-2xl bg-card border-2 border-primary ring-2 ring-primary/20 shadow-lg shadow-primary/5"
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              </div>

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">Professional</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-foreground">{isAnnual ? "$100" : "$9.99"}</span>
                  <span className="text-muted-foreground ml-1">{isAnnual ? "/year" : "/month"}</span>
                </div>
                <p className="text-muted-foreground">For growing businesses and marketing teams</p>
              </div>

              <div className="space-y-4 mb-6">
                {[
                  "Multi Brand Monitoring up to 10",
                  "Unlimited Data refresh",
                  "Multi Market Analysis for Brand"
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                    <span className="text-foreground text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Dashboards Section */}
              <div className="border-t border-border/30 pt-4 mb-6">
                <h4 className="text-sm font-medium text-foreground mb-3">Dashboards</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                    <span className="text-foreground text-sm">Keyword Analysis</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                    <span className="text-foreground text-sm">Sentiment Analysis</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                    <span className="text-foreground text-sm">Brand Identity</span>
                  </div>
                </div>
              </div>

              {/* Settings & Support Section */}
              <div className="border-t border-border/30 pt-4 mb-6">
                <h4 className="text-sm font-medium text-foreground mb-3">Settings & Support</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                    <span className="text-foreground text-sm">Priority Support (24h)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                    <span className="text-foreground text-sm">2 seats in workspace</span>
                  </div>
                </div>
              </div>

              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => onNavigate('signup')}
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to know about Brand Sense pricing and features.
            </p>
          </motion.div>
          
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-card rounded-lg p-6 border border-border/50"
            >
              <h3 className="text-lg font-semibold text-foreground mb-3">
                What's the difference between Starter and Professional plans?
              </h3>
              <p className="text-muted-foreground">
                Starter is perfect for individuals and small businesses with single brand monitoring, 
                limited data refresh, and basic keyword analysis. Professional offers multi-brand monitoring 
                (up to 10 brands), unlimited data refresh, sentiment analysis, brand identity insights, 
                and priority support.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-card rounded-lg p-6 border border-border/50"
            >
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Can I change plans anytime?
              </h3>
              <p className="text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, 
                and you'll only pay the prorated difference for upgrades or receive credits for downgrades.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-card rounded-lg p-6 border border-border/50"
            >
              <h3 className="text-lg font-semibold text-foreground mb-3">
                What happens to my data if I cancel?
              </h3>
              <p className="text-muted-foreground">
                Your data is safely stored for 30 days after cancellation. You can reactivate your account 
                anytime during this period to restore all your brand monitoring data and insights.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-card rounded-lg p-6 border border-border/50"
            >
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Is there a free trial for Professional?
              </h3>
              <p className="text-muted-foreground">
                Yes! Start with our free Starter plan and upgrade to Professional when you're ready. 
                You can also contact our sales team for a personalized demo of Professional features.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              className="bg-card rounded-lg p-6 border border-border/50"
            >
              <h3 className="text-lg font-semibold text-foreground mb-3">
                How does the workspace feature work?
              </h3>
              <p className="text-muted-foreground">
                Starter includes 1 seat in your workspace, while Professional includes 2 seats. 
                You can invite team members to collaborate on brand monitoring and share insights 
                across your organization.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
              className="bg-card rounded-lg p-6 border border-border/50"
            >
              <h3 className="text-lg font-semibold text-foreground mb-3">
                What does "Limited data refresh" mean?
              </h3>
              <p className="text-muted-foreground">
                Starter plan includes basic data refresh capabilities, while Professional offers 
                unlimited data refresh to ensure you always have the most current brand insights 
                and AI conversation data.
              </p>
            </motion.div>
            
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              viewport={{ once: true }}
              className="bg-card rounded-lg p-6 border border-border/50"
            >
              <h3 className="text-lg font-semibold text-foreground mb-3">
                How does the annual pricing work?
              </h3>
              <p className="text-muted-foreground">
                Annual billing saves you 17% compared to monthly billing. You'll be charged 
                $100/year instead of $9.99/month, and you can switch between monthly and annual 
                billing at any time.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <BrandLogo />
            </div>
            
            <div className="flex items-center gap-6">
              <button 
                onClick={() => onNavigate('terms')}
                className="text-muted-foreground hover:text-primary transition-colors" 
                style={{ fontSize: '14px' }}
              >
                Terms of Service
              </button>
              
              <button 
                onClick={() => onNavigate('privacy')}
                className="text-muted-foreground hover:text-primary transition-colors" 
                style={{ fontSize: '14px' }}
              >
                Privacy Policy
              </button>
              
              <button 
                onClick={() => onNavigate('refund')}
                className="text-muted-foreground hover:text-primary transition-colors" 
                style={{ fontSize: '14px' }}
              >
                Refund Policy
              </button>
              
              <button 
                onClick={() => setShowSupportDialog(true)}
                className="text-muted-foreground hover:text-primary transition-colors" 
                style={{ fontSize: '14px' }}
              >
                Support
              </button>
            </div>
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
