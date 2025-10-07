import { Sparkles, Info, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { Project } from "../lib/types";
import { storage } from "../lib/storage";
import { toast } from "sonner@2.0.3";
import { useEffect } from "react";

interface BrandIdentityProps {
  project: Project;
}

// DEPRECATED: This will be replaced with API data
const legacyProjectData: Record<string, any> = {
  "1": { // Nike Türkiye
    bpmData: [
      { name: "Visibility", score: 86, description: "How often and prominently the brand appears across LLM-generated contexts." },
      { name: "Consistency", score: 82, description: "How coherent its tone, values, and messaging appear across topics." },
      { name: "Emotional Resonance", score: 78, description: "How strongly the brand evokes emotional or cultural reactions." },
      { name: "Distinctiveness", score: 84, description: "How clearly it stands out from category-level or generic mentions." },
    ],
    totalBPM: 83,
    toneData: [
      { trait: "Innovation", fullName: "Innovation", score: 85 },
      { trait: "Trust / Reliability", fullName: "Trust / Reliability", score: 74 },
      { trait: "Accessibility", fullName: "Accessibility / Mass Appeal", score: 77 },
      { trait: "Prestige", fullName: "Prestige / Premium Feel", score: 80 },
      { trait: "Activism", fullName: "Activism / Social Responsibility", score: 88 },
      { trait: "Performance", fullName: "Performance / Technical Expertise", score: 90 },
    ],
    brandPowerStatement: `Nike's AI presence in the Turkish market reflects a brand with exceptionally strong brand power in the fields of yenilikçi, özgüvenli, aspirasyonel; technical and especially encouraging features. Digital awareness practices are very broad; from the premium to mid-range market. This cohesion represents <strong>Brand Power</strong>.`,
    brandIdentitySummary: `Nike, LLM'lerin Türkiye bağlamındaki algısında <strong class="text-foreground">spor-performans merkezli kültürel ikon</strong> olarak konumlanır; koşu ve futbol eksenindeki pratik faydayı Jordan/Air Max gibi sembolik mirasla birleştirir. Kimlik tonu <strong class="text-foreground">yenilikçi, özgüvenli, aspirasyonel</strong>dir; teknik inovasyon (Pegasus, Dri-FIT) ve düzenli lansman ritmi görünürlüğü ve anlatı tutarlılığını besler. Dijital ayak izi (uygulama/üyelik, içerik akışları) ile topluluk temelli söylem, duygusal rezonansı yükseltir ve günlük yaşam tarzına köprü kurar. Bu bütünlük <strong class="text-foreground">Brand Power Metric (BPM)</strong> üzerinde güçlü bir bilişsel kimlik sinyali üretir.`,
    dominantThemes: [
      { title: "Hero (Kahraman)", description: "Nike primarily positions itself as the brand that encourages and strengthens customers, promoting an empowering 'Just Do It' philosophy.", impact: "Very High" },
      { title: "Performance & Sports Culture", description: "The brand identity is conveyed through deeply rooted associations with sports achievements, athlete stories, and advanced product technologies.", impact: "High" },
      { title: "Innovation Leadership", description: "Positioning is articulated through an innovative discourse focused on product development, new technologies and continuous evolution. This discourse conveys both a competitive advantage and brand personality.", impact: "High" },
    ],
    coreBrandPersona: `Nike is frequently portrayed by ChatGPT as a brand that encourages its audience, builds self-confidence, and embodies an innovative, bold sporting spirit. This persona is frequently intertwined with technical terms (e.g., React Foam, Air Cushioning), achievements of elite athletes (e.g., LeBron James, Cristiano Ronaldo), or major sporting events (e.g., the Olympics).`,
    keyAssociations: [
      "Pegasus 41 / Pegasus ailesi",
      "Koşu performansı",
      "Jordan / basketbol mirası",
      "Air Max / ikon sneaker",
      "Türkiye Milli Takım formaları",
      "Dri-FIT / teknik kumaş",
      "Krampon / futbol ekipmanı",
      "Sneaker kültürü / yaşam tarzı",
      "Nike App & Üyelik / lansman takibi",
      "Seri sonu & indirim akışı",
    ],
  },
};

export function BrandIdentity({ project }: BrandIdentityProps) {
  const brandName = project.name;
  
  // Try to get data from storage first, fallback to legacy data
  const storedData = storage.getProjectData(project.id);
  const brandIdentityData = storedData?.brandIdentity;
  
  // 🔍 Data Validation: Check if brandIdentityData contains mismatched brand name
  let validatedData = brandIdentityData;
  let dataMismatchDetected = false;
  let mismatchedBrandName = '';
  
  if (brandIdentityData) {
    const dataString = JSON.stringify(brandIdentityData).toLowerCase();
    const projectBrandName = brandName.toLowerCase().trim();
    
    // Comprehensive list of common brand names for mismatch detection
    const commonBrandNames = [
      'vodafone', 'nike', 'apple', 'samsung', 'coca-cola', 'pepsi',
      'puma', 'adidas', 'reebok', 'under armour', 'new balance',
      'balparmak', 'ülker', 'eti', 'türk telekom', 'turkcell',
      'microsoft', 'google', 'amazon', 'facebook', 'meta',
      'tesla', 'bmw', 'mercedes', 'audi', 'volkswagen',
      'mcdonalds', 'burger king', 'starbucks', 'dunkin'
    ];
    
    // Check if data contains a different brand name (data mismatch detection)
    const foundMismatchedBrand = commonBrandNames.find(brand => {
      // Skip if this is the project's brand
      if (brand === projectBrandName) return false;
      
      // Check if data contains this brand name
      // Use word boundary check to avoid false positives (e.g., "nike" in "nike's")
      const brandRegex = new RegExp(`\\b${brand}\\b`, 'i');
      return brandRegex.test(dataString) && !brandRegex.test(projectBrandName);
    });
    
    if (foundMismatchedBrand) {
      dataMismatchDetected = true;
      mismatchedBrandName = foundMismatchedBrand;
      console.error(`🚨 DATA MISMATCH DETECTED: Project "${brandName}" contains data for "${foundMismatchedBrand}"`);
      console.error(`   Backend returned wrong data or localStorage is corrupted.`);
      console.error(`   Falling back to placeholder data. Please REFRESH the dashboard.`);
      console.error(`   If problem persists, clear localStorage: localStorage.clear()`);
      validatedData = null; // Force placeholder data
    }
  }
  
  // Show toast notification when data mismatch is detected
  useEffect(() => {
    if (dataMismatchDetected) {
      toast.error('Data Mismatch Detected', {
        description: `Project "${brandName}" contains data for "${mismatchedBrandName}". Click to fix.`,
        duration: 12000,
        action: {
          label: 'Fix Now',
          onClick: () => {
            // Trigger global data recovery
            const event = new CustomEvent('trigger-data-recovery');
            window.dispatchEvent(event);
          },
        },
      });
    }
  }, [dataMismatchDetected, brandName, mismatchedBrandName]);
  
  // Get project-specific data or use placeholder
  const data = validatedData || legacyProjectData[project.id] || {
    bpmData: [
      { name: "Visibility", score: 0, description: "How often and prominently the brand appears across LLM-generated contexts." },
      { name: "Consistency", score: 0, description: "How coherent its tone, values, and messaging appear across topics." },
      { name: "Emotional Resonance", score: 0, description: "How strongly the brand evokes emotional or cultural reactions." },
      { name: "Distinctiveness", score: 0, description: "How clearly it stands out from category-level or generic mentions." },
    ],
    totalBPM: 0,
    toneData: [
      { trait: "Innovation", fullName: "Innovation", score: 0 },
      { trait: "Trust / Reliability", fullName: "Trust / Reliability", score: 0 },
      { trait: "Accessibility", fullName: "Accessibility / Mass Appeal", score: 0 },
      { trait: "Prestige", fullName: "Prestige / Premium Feel", score: 0 },
      { trait: "Activism", fullName: "Activism / Social Responsibility", score: 0 },
      { trait: "Performance", fullName: "Performance / Technical Expertise", score: 0 },
    ],
    brandPowerStatement: `Analysis for ${brandName} is being prepared. Data will be available after the first refresh.`,
    dominantThemes: [],
    coreBrandPersona: `Brand persona analysis for ${brandName} will be available after the dashboard refresh.`,
    keyAssociations: [],
    brandIdentitySummary: `Analysis for ${brandName} is being prepared. Data will be available after the first refresh.`,
  };

  const { bpmData, totalBPM, toneData, brandPowerStatement, dominantThemes, coreBrandPersona } = data;

  // Key Associations - project specific
  const keyAssociations = data.keyAssociations || [];
  const brandIdentitySummary = data.brandIdentitySummary || brandPowerStatement;

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* 1. Brand Identity Summary - First Row */}
        <div className="p-8 rounded-xl border border-border bg-card">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-foreground tracking-tight mb-3 text-[18px] font-medium">
                Brand Identity Summary
              </h3>
              <p 
                className="text-muted-foreground tracking-tight text-[15px] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: brandIdentitySummary }}
              />
            </div>
          </div>
        </div>

        {/* 2. Brand Power Metric (BPM) with Formula and Tooltips */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-foreground tracking-tight text-[16px] font-medium">
              Brand Power Metric (BPM)
            </h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <HelpCircle className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-[13px] leading-relaxed">
                  <strong>Formula:</strong> BPM = (Visibility + Consistency + Emotional Resonance + Distinctiveness) / 4
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-muted-foreground tracking-tight text-[13px] mb-4">
            Formula: BPM = (Visibility + Consistency + Emotional Resonance + Distinctiveness) / 4
          </p>
          <div className="grid grid-cols-5 gap-4">
            {/* Individual Metrics with Tooltips */}
            {bpmData.map((item) => (
              <div
                key={item.name}
                className="p-5 rounded-xl border border-border bg-card hover:border-primary/30 transition-all duration-200"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <p className="text-muted-foreground tracking-tight text-[13px] flex-1">
                      {item.name}
                    </p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="shrink-0 opacity-40 hover:opacity-100 transition-opacity">
                          <Info className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent 
                        side="top" 
                        className="max-w-[280px] bg-popover border-border text-popover-foreground"
                      >
                        <p className="tracking-tight text-[13px] leading-relaxed">
                          {item.description}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-foreground tracking-tight text-[28px] font-medium">
                      {item.score}
                    </span>
                    <span className="text-muted-foreground tracking-tight text-[14px]">
                      /100
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Total BPM - Highlighted */}
            <div className="p-5 rounded-xl border border-primary/30 bg-primary/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
              <div className="space-y-3 relative z-10">
                <p className="text-primary tracking-tight text-[13px] font-medium">
                  Total BPM
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-primary tracking-tight text-[32px] font-medium">
                    {totalBPM}
                  </span>
                  <span className="text-primary/60 tracking-tight text-[14px]">
                    /100
                  </span>
                </div>
                <p className="text-primary/70 tracking-tight text-[12px]">
                  Average Score
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Two Column Row: Key Associations + Tone Profile */}
        <div className="grid grid-cols-2 gap-6">
          {/* Key Associations */}
          <div className="p-6 rounded-xl border border-border bg-card">
            <h3 className="text-foreground tracking-tight mb-4 text-[16px] font-medium">
              Key Associations (Top 10)
            </h3>
            <div className="space-y-3">
              {keyAssociations.map((association, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-all duration-150"
                >
                  <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-primary tracking-tight text-[13px] font-medium">
                      {index + 1}
                    </span>
                  </div>
                  <span className="text-foreground tracking-tight text-[14px]">
                    {association}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tone Profile - Radar Chart */}
          <div className="p-6 rounded-xl border border-border bg-card">
            <h3 className="text-foreground tracking-tight mb-6 text-[16px] font-medium">
              Tone Profile
            </h3>
            <div className="h-[360px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={toneData} outerRadius="70%">
                  <PolarGrid stroke="#333333" strokeOpacity={0.3} />
                  <PolarAngleAxis
                    dataKey="trait"
                    tick={({ x, y, payload }) => {
                      // Add extra spacing for all labels to prevent overlap with axis numbers
                      return (
                        <text
                          x={x}
                          y={y - 8}
                          fill="#EDEDED"
                          fontSize={13}
                          textAnchor="middle"
                        >
                          {payload.value}
                        </text>
                      );
                    }}
                    stroke="#333333"
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: "#EDEDED", fontSize: 13 }}
                    stroke="#333333"
                  />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#0070F3"
                    fill="#0070F3"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Tone Metrics Legend - 3x2 Grid */}
            <div className="mt-6 pt-6 border-t border-border space-y-4">
              {/* First Row - 3 items */}
              <div className="grid grid-cols-3 gap-6">
                {toneData.slice(0, 3).map((item) => (
                  <div key={item.trait} className="text-center">
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span className="text-foreground tracking-tight text-[28px] font-medium">
                        {item.score}
                      </span>
                      <span className="text-muted-foreground tracking-tight text-[14px]">
                        /100
                      </span>
                    </div>
                    <p className="text-muted-foreground tracking-tight text-[13px]">
                      {item.fullName}
                    </p>
                  </div>
                ))}
              </div>
              
              {/* Second Row - 3 items */}
              <div className="grid grid-cols-3 gap-6">
                {toneData.slice(3, 6).map((item) => (
                  <div key={item.trait} className="text-center">
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span className="text-foreground tracking-tight text-[28px] font-medium">
                        {item.score}
                      </span>
                      <span className="text-muted-foreground tracking-tight text-[14px]">
                        /100
                      </span>
                    </div>
                    <p className="text-muted-foreground tracking-tight text-[13px]">
                      {item.fullName}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>


      </div>
    </TooltipProvider>
  );
}
