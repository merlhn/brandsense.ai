import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Sparkles, 
  Heart,
  Info,
  HelpCircle
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Project } from "../lib/types";
import { storage } from "../lib/storage";
import { toast } from "sonner@2.0.3";
import { useEffect } from "react";

interface SentimentAnalysisProps {
  project: Project;
}

// DEPRECATED: This will be replaced with API data
const legacyProjectData: Record<string, any> = {
  "1": { // Nike Türkiye
    mainSentiments: [
      { name: "Positive", score: 82, trend: "up" as const, color: "success", themes: "Pegasus 41, koşu performansı, Jordan, Air Max", summary: "Yenilik, performans odaklı başarı ve kampanya dili markaya hâkim pozitif tınıyı güçlendiriyor." },
      { name: "Neutral", score: 54, trend: "stable" as const, color: "muted", themes: "Seri sonu/indirim, stok dönüşü, geniş ürün yelpazesi", summary: "Fiyat, stok ve seri sonu içerikleri nötr bilgi tonunu koruyor." },
      { name: "Negative", score: 33, trend: "stable" as const, color: "destructive", themes: "Çin'de zayıf satışlar, marj baskısı, ücretli ithalat vergileri", summary: "Küresel maliyet baskısı ve Çin pazarındaki durgunluk zayıf negatif yankılar yaratıyor." },
      { name: "Mixed", score: 61, trend: "up" as const, color: "primary", themes: "Toptan kanal toparlanması, DTC yavaş seyir, talep yaratma", summary: "Talep artışı ve finansal temkinlilik birlikte \"kontrollü iyimserlik\" atmosferi oluşturuyor." },
    ],
  },
};

export function SentimentAnalysis({ project }: SentimentAnalysisProps) {
  const brandName = project.name;
  
  // Try to get data from storage first, fallback to legacy data
  const storedData = storage.getProjectData(project.id);
  const sentimentData = storedData?.sentimentAnalysis;
  
  // 🔍 Data Validation: Check if sentimentData contains mismatched brand name
  let validatedSentimentData = sentimentData;
  let dataMismatchDetected = false;
  let mismatchedBrandName = '';
  
  if (sentimentData) {
    const dataString = JSON.stringify(sentimentData).toLowerCase();
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
      if (brand === projectBrandName) return false;
      const brandRegex = new RegExp(`\\b${brand}\\b`, 'i');
      return brandRegex.test(dataString) && !brandRegex.test(projectBrandName);
    });
    
    if (foundMismatchedBrand) {
      dataMismatchDetected = true;
      mismatchedBrandName = foundMismatchedBrand;
      console.error(`🚨 DATA MISMATCH DETECTED in Sentiment: Project "${brandName}" contains data for "${foundMismatchedBrand}"`);
      validatedSentimentData = null; // Force placeholder data
    }
  }
  
  // Show toast notification when data mismatch is detected
  useEffect(() => {
    if (dataMismatchDetected) {
      toast.error('Data Mismatch Detected', {
        description: `Project "${brandName}" contains data for "${mismatchedBrandName}". Please refresh dashboard.`,
        duration: 8000,
      });
    }
  }, [dataMismatchDetected, brandName, mismatchedBrandName]);
  
  // Get project-specific data or use placeholder
  const data = validatedSentimentData || legacyProjectData[project.id] || {
    mainSentiments: [
      { name: "Positive", score: 0, trend: "stable" as const, color: "success", themes: "No data yet", summary: "Analysis will be available after the first refresh." },
      { name: "Neutral", score: 0, trend: "stable" as const, color: "muted", themes: "No data yet", summary: "Analysis will be available after the first refresh." },
      { name: "Negative", score: 0, trend: "stable" as const, color: "destructive", themes: "No data yet", summary: "Analysis will be available after the first refresh." },
      { name: "Mixed", score: 0, trend: "stable" as const, color: "primary", themes: "No data yet", summary: "Analysis will be available after the first refresh." },
    ],
  };

  // Map API data to component format
  const mainSentiments = validatedSentimentData?.primarySentiments?.map(s => ({
    name: s.category,
    score: s.score,
    trend: "stable" as const, // API doesn't provide trend for primary sentiments
    color: s.colorType,
    themes: s.themes,
    summary: s.themes, // Use themes as summary if no summary provided
  })) || data.mainSentiments || [];

  // Emotional clusters - use API data if available, otherwise use placeholder
  const emotionalClusters = validatedSentimentData?.emotionalClusters || [
    {
      name: "Excitement",
      score: 0,
      explanation: "Emotional analysis will be available after the first refresh."
    },
    {
      name: "Trust",
      score: 0,
      explanation: "Emotional analysis will be available after the first refresh."
    },
    {
      name: "Pride",
      score: 0,
      explanation: "Emotional analysis will be available after the first refresh."
    },
    {
      name: "Confidence",
      score: 0,
      explanation: "Emotional analysis will be available after the first refresh."
    },
    {
      name: "Skepticism",
      score: 0,
      explanation: "Emotional analysis will be available after the first refresh."
    },
  ];

  // Full sentiment profile for table - use API data if available, otherwise use placeholder
  const sentimentProfile = validatedSentimentData?.sentimentProfile || [
    { 
      dimension: "Trust", 
      score: 0, 
      trend: "stable" as const,
      themes: "No data yet",
      summary: "Sentiment analysis will be available after the first refresh."
    },
    { 
      dimension: "Joy", 
      score: 0, 
      trend: "stable" as const,
      themes: "No data yet",
      summary: "Sentiment analysis will be available after the first refresh."
    },
    { 
      dimension: "Pride", 
      score: 0, 
      trend: "stable" as const,
      themes: "No data yet",
      summary: "Sentiment analysis will be available after the first refresh."
    },
    { 
      dimension: "Excitement", 
      score: 0, 
      trend: "stable" as const,
      themes: "No data yet",
      summary: "Sentiment analysis will be available after the first refresh."
    },
    { 
      dimension: "Value Sensitivity", 
      score: 0, 
      trend: "stable" as const,
      themes: "No data yet",
      summary: "Sentiment analysis will be available after the first refresh."
    },
    { 
      dimension: "Confidence", 
      score: 0, 
      trend: "stable" as const,
      themes: "No data yet",
      summary: "Sentiment analysis will be available after the first refresh."
    },
    { 
      dimension: "Skepticism", 
      score: 0, 
      trend: "stable" as const,
      themes: "No data yet",
      summary: "Sentiment analysis will be available after the first refresh."
    },
    { 
      dimension: "Solidarity / Controversy", 
      score: 0, 
      trend: "stable" as const,
      themes: "No data yet",
      summary: "Sentiment analysis will be available after the first refresh."
    },
  ];

  const getTrendIcon = (trend: "up" | "stable" | "down") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4" />;
      case "down":
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendColor = (trend: "up" | "stable" | "down") => {
    switch (trend) {
      case "up":
        return "text-success";
      case "down":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const getScoreColor = (colorType: string, score: number) => {
    if (colorType === "success") return "text-success";
    if (colorType === "destructive") return "text-destructive";
    if (colorType === "primary") return "text-primary";
    return "text-foreground";
  };

  const getProgressColor = (colorType: string) => {
    if (colorType === "success") return "bg-success";
    if (colorType === "destructive") return "bg-destructive";
    if (colorType === "primary") return "bg-primary";
    return "bg-muted-foreground";
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        {/* 1. Overall Sentiment Summary */}
        <div className="p-8 rounded-xl border border-border bg-card">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-foreground tracking-tight mb-3 text-[18px] font-medium">
                Overall Sentiment Summary
              </h3>
              {sentimentData?.overallSummary ? (
                <p className="text-muted-foreground tracking-tight text-[15px] leading-relaxed">
                  {sentimentData.overallSummary}
                </p>
              ) : (
                <p className="text-muted-foreground tracking-tight text-[15px] leading-relaxed">
                  Overall sentiment analysis for <strong className="text-foreground">{brandName}</strong> will be available after the first refresh. The AI model will analyze brand perception across multiple dimensions including positive, neutral, negative, and mixed sentiments.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 2. Primary Sentiment Scores */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-foreground tracking-tight text-[16px] font-medium">
              Primary Sentiment Scores
            </h3>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button type="button" className="inline-flex text-muted-foreground hover:text-foreground transition-colors">
                  <HelpCircle className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-[13px] leading-relaxed">
                  <strong>Four main tone categories</strong> (Positive, Neutral, Negative, Mixed). 
                  Score (0–100) shows relative intensity in ChatGPT's perception. 
                  Trend direction (↑ / → / ↓) indicates if the sentiment has strengthened, stayed stable, or weakened.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {mainSentiments.map((item) => (
              <div
                key={item.name}
                className="p-5 rounded-xl border border-border bg-card hover:border-primary/30 transition-all duration-200"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground tracking-tight text-[13px]">
                      {item.name}
                    </p>
                    <div className={getTrendColor(item.trend)}>
                      {getTrendIcon(item.trend)}
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className={`tracking-tight text-[28px] font-medium ${getScoreColor(item.color, item.score)}`}>
                      {item.score}
                    </span>
                    <span className="text-muted-foreground tracking-tight text-[14px]">
                      /100
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getProgressColor(item.color)}`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  <p className="text-muted-foreground tracking-tight text-[12px] leading-relaxed">
                    {item.summary}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Emotional Cluster Analysis */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="text-foreground tracking-tight text-[16px] font-medium">
                Emotional Cluster Analysis
              </h3>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <button type="button" className="inline-flex text-muted-foreground hover:text-foreground transition-colors">
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-[13px] leading-relaxed">
                    <strong>Core emotions</strong> (e.g., Excitement, Trust, Pride, Skepticism) that dominate ChatGPT's brand understanding. 
                    Strength (0–100) shows the intensity level of each emotional driver.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left py-3 px-6 text-muted-foreground tracking-tight text-[13px] font-medium">
                    Emotional Driver
                  </th>
                  <th className="text-center py-3 px-4 text-muted-foreground tracking-tight text-[13px] font-medium">
                    Strength (0–100)
                  </th>
                  <th className="text-left py-3 px-6 text-muted-foreground tracking-tight text-[13px] font-medium">
                    Explanation
                  </th>
                </tr>
              </thead>
              <tbody>
                {emotionalClusters.map((item, index) => (
                  <tr 
                    key={item.name} 
                    className={`border-b border-border/50 hover:bg-secondary/30 transition-colors ${
                      index % 2 === 0 ? 'bg-transparent' : 'bg-secondary/20'
                    }`}
                  >
                    <td className="py-4 px-6 text-foreground tracking-tight text-[14px] font-medium">
                      {item.name}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-foreground tracking-tight text-[16px] font-medium">
                          {item.score}
                        </span>
                        <span className="text-muted-foreground tracking-tight text-[12px]">
                          /100
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-muted-foreground tracking-tight text-[13px] leading-relaxed">
                      {item.explanation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Detailed Sentiment Profile Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-2">
              <h3 className="text-foreground tracking-tight text-[16px] font-medium">
                Detailed Sentiment Profile
              </h3>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <button type="button" className="inline-flex text-muted-foreground hover:text-foreground transition-colors">
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-[13px] leading-relaxed">
                    <strong>Secondary emotional tones</strong> beyond the main four categories. 
                    Score (0–100) shows relative emotional strength. 
                    Trend (↑ / → / ↓) indicates if this emotion is rising, stable, or declining. 
                    Themes are 3–5 recurring ideas linking the brand to this sentiment.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left py-3 px-6 text-muted-foreground tracking-tight text-[13px] font-medium">
                    Sentiment Dimension
                  </th>
                  <th className="text-center py-3 px-4 text-muted-foreground tracking-tight text-[13px] font-medium">
                    Score
                  </th>
                  <th className="text-center py-3 px-4 text-muted-foreground tracking-tight text-[13px] font-medium">
                    Trend
                  </th>
                  <th className="text-left py-3 px-6 text-muted-foreground tracking-tight text-[13px] font-medium">
                    Representative Themes / Keywords
                  </th>
                  <th className="text-left py-3 px-6 text-muted-foreground tracking-tight text-[13px] font-medium">
                    Example Tone Summary
                  </th>
                </tr>
              </thead>
              <tbody>
                {sentimentProfile.map((row, index) => (
                  <tr 
                    key={row.dimension} 
                    className={`border-b border-border/50 hover:bg-secondary/30 transition-colors ${
                      index % 2 === 0 ? 'bg-transparent' : 'bg-secondary/20'
                    }`}
                  >
                    <td className="py-4 px-6 text-foreground tracking-tight text-[14px] font-medium">
                      {row.dimension}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-foreground tracking-tight text-[16px] font-medium">
                          {row.score}
                        </span>
                        <span className="text-muted-foreground tracking-tight text-[12px]">
                          /100
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className={`flex items-center justify-center ${getTrendColor(row.trend)}`}>
                        {getTrendIcon(row.trend)}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-muted-foreground tracking-tight text-[13px] leading-relaxed">
                      {row.themes}
                    </td>
                    <td className="py-4 px-6 text-muted-foreground tracking-tight text-[13px] leading-relaxed">
                      {row.summary}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>


      </div>
    </TooltipProvider>
  );
}
