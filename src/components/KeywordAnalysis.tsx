import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
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

interface KeywordData {
  keyword: string;
  visibility: number;
  trend: "up" | "down" | "stable";
  tone: "Positive" | "Neutral" | "Negative";
  share: number;
  explanation: string;
}

interface KeywordAnalysisProps {
  project: Project;
}

// DEPRECATED: This will be replaced with API data
const legacyProjectKeywordData: Record<string, KeywordData[]> = {
  "1": [ // Nike Türkiye
  { keyword: "Pegasus", visibility: 92, trend: "up", tone: "Positive", share: 10, explanation: "Koşuda performans ve güvenilirlik sembolü olarak en yüksek görünürlüğe sahip." },
  { keyword: "Koşu performansı", visibility: 89, trend: "up", tone: "Positive", share: 8, explanation: "Antrenman/tempo/mesafe anlatıları markanın performans çekirdeğini güçlendiriyor." },
  { keyword: "Jordan", visibility: 86, trend: "stable", tone: "Positive", share: 7, explanation: "Basketbol mirası ve ikonluk, aspirasyonel kimliği sürekli besliyor." },
  { keyword: "Air Max", visibility: 85, trend: "up", tone: "Positive", share: 6, explanation: "Günlük yaşam tarzında ikonik görünürlük ve trend sürekliliği sağlıyor." },
  { keyword: "Milli Takım forması", visibility: 84, trend: "up", tone: "Positive", share: 6, explanation: "Yerel futbol bağı, sembolik yakınlık ve gurur temasını artırıyor." },
  { keyword: "Dri-FIT", visibility: 82, trend: "stable", tone: "Positive", share: 6, explanation: "Teknik kumaş/konfor vurgusu, fonksiyonel yenilik algısını pekiştiriyor." },
  { keyword: "Krampon", visibility: 81, trend: "stable", tone: "Positive", share: 5, explanation: "Futbol ekipmanı çeşitliliği, saha performansı çağrışımı yaratıyor." },
  { keyword: "Sneaker kültürü", visibility: 80, trend: "up", tone: "Positive", share: 5, explanation: "Drop/trend kültürüyle şehir ve lifestyle hattında güçlü görünürlük." },
  { keyword: "Nike App", visibility: 78, trend: "up", tone: "Neutral", share: 5, explanation: "Lansman/stoğa dönüş bildirimleri dijital etkileşimi diri tutuyor." },
  { keyword: "İndirim", visibility: 77, trend: "up", tone: "Neutral", share: 5, explanation: "Dönemsel promosyonlar erişimi ve satın alma niyetini destekliyor." },
  { keyword: "Topluluk", visibility: 76, trend: "up", tone: "Positive", share: 4, explanation: "Koşu kulüpleri/yerel etkinlikler aidiyet ve tekrar temas oluşturuyor." },
  { keyword: "Konfor", visibility: 75, trend: "stable", tone: "Positive", share: 4, explanation: "Yastıklama ve günlük kullanım rahatlığı geniş kitle memnuniyeti üretiyor." },
  { keyword: "Tasarım", visibility: 74, trend: "stable", tone: "Positive", share: 4, explanation: "Renk/forma estetiği, ayırt edici görünümü destekliyor." },
  { keyword: "Basketbol kültürü", visibility: 73, trend: "stable", tone: "Positive", share: 4, explanation: "Jordan ekseninde topluluk ve başarı anlatısı kalıcı bir çekirdek oluşturuyor." },
  { keyword: "Yaşam tarzı", visibility: 72, trend: "up", tone: "Positive", share: 4, explanation: "Spor dışı kullanımda görünürlük, markayı günlük rutine taşıyor." },
  { keyword: "Yenilik hızı", visibility: 71, trend: "up", tone: "Positive", share: 3, explanation: "Düzenli ürün döngüsü 'daima yeni' algısını sürdürüyor." },
  { keyword: "Sürdürülebilirlik", visibility: 70, trend: "stable", tone: "Neutral", share: 3, explanation: "Malzeme/çevre söylemi görünür; etki seviyesi orta bantta kalıyor." },
  { keyword: "Kadın sporu", visibility: 69, trend: "up", tone: "Positive", share: 3, explanation: "Kapsayıcı iletişim ve ürün odağı, büyüyen bir alt küme yaratıyor." },
  { keyword: "Fiyat duyarlılığı", visibility: 66, trend: "stable", tone: "Negative", share: 4, explanation: "Erişilebilirlik tartışmaları temkinli/karışık tonu besliyor." },
  { keyword: "Etik tedarik", visibility: 62, trend: "stable", tone: "Negative", share: 4, explanation: "Dönemsel etik/tedarik zinciri gündemleri düşük payla kuşku üretiyor." },
  ],
};

const getTrendIcon = (trend: "up" | "down" | "stable") => {
  switch (trend) {
    case "up":
      return <TrendingUp className="w-4 h-4 text-success" />;
    case "down":
      return <TrendingDown className="w-4 h-4 text-destructive" />;
    case "stable":
      return <Minus className="w-4 h-4 text-muted-foreground" />;
  }
};

const getToneColor = (tone: "Positive" | "Neutral" | "Negative") => {
  switch (tone) {
    case "Positive":
      return "text-success";
    case "Negative":
      return "text-destructive";
    case "Neutral":
      return "text-muted-foreground";
  }
};

const getVisibilityColor = (visibility: number) => {
  if (visibility >= 80) return "text-success";
  if (visibility >= 60) return "text-primary";
  return "text-muted-foreground";
};

export function KeywordAnalysis({ project }: KeywordAnalysisProps) {
  const brandName = project.name;
  
  // Try to get data from storage first, fallback to legacy data
  const storedData = storage.getProjectData(project.id);
  const keywordAnalysisData = storedData?.keywordAnalysis;
  
  // 🔍 Data Validation: Check if keywordAnalysisData contains mismatched brand name
  let validatedKeywordData = keywordAnalysisData;
  let dataMismatchDetected = false;
  let mismatchedBrandName = '';
  
  if (keywordAnalysisData) {
    const dataString = JSON.stringify(keywordAnalysisData).toLowerCase();
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
      console.error(`🚨 DATA MISMATCH DETECTED in Keywords: Project "${brandName}" contains data for "${foundMismatchedBrand}"`);
      validatedKeywordData = null; // Force placeholder data
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
  const keywordData = validatedKeywordData?.keywords || legacyProjectKeywordData[project.id] || [
    { keyword: "No data yet", visibility: 0, trend: "stable" as const, tone: "Neutral" as const, share: 0, explanation: "Analysis will be available after the first refresh." },
  ];

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-8">
        {/* Summary */}
        <div className="p-6 rounded-xl border border-border bg-card">
          <h3 className="text-foreground mb-4 tracking-tight text-[15px] font-medium">Summary</h3>
          {validatedKeywordData?.summary ? (
            <p className="text-muted-foreground leading-relaxed text-[15px]">
              {validatedKeywordData.summary}
            </p>
          ) : (
            <p className="text-muted-foreground leading-relaxed text-[15px]">
              Keyword analysis for <strong className="text-foreground">{brandName}</strong> will be available after the first refresh. The AI model will identify key associations, their visibility trends, and sentiment tones.
            </p>
          )}
        </div>

        {/* Keyword Overview Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-[rgba(216,54,54,0)]">
            <h3 className="text-foreground tracking-tight text-[15px] font-medium">Keyword Overview</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-left text-muted-foreground tracking-tight text-[13px] font-medium uppercase">Keyword</th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground tracking-tight text-[13px] font-medium uppercase">Visibility</span>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <button type="button" className="inline-flex">
                            <Info className="w-3.5 h-3.5 text-muted-foreground/50 hover:text-muted-foreground cursor-help transition-colors" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-[13px] leading-relaxed">
                            <span className="font-medium">Chat GPT Visibility Index (0–100)</span> indicates how strongly this keyword is cognitively associated with the brand in ChatGPT's understanding.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground tracking-tight text-[13px] font-medium uppercase">Trend</span>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <button type="button" className="inline-flex">
                            <Info className="w-3.5 h-3.5 text-muted-foreground/50 hover:text-muted-foreground cursor-help transition-colors" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-[13px] leading-relaxed">
                            <span className="font-medium">Trend Direction (↑ / → / ↓)</span> indicates whether the brand–keyword connection is strengthening, stable, or weakening based on recent content or conversation patterns.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground tracking-tight text-[13px] font-medium uppercase">Tone</span>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <button type="button" className="inline-flex">
                            <Info className="w-3.5 h-3.5 text-muted-foreground/50 hover:text-muted-foreground cursor-help transition-colors" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-[13px] leading-relaxed">
                            <span className="font-medium">Tone (Positive / Neutral / Negative)</span> represents the overall sentiment in how the model frames this keyword in relation to the brand.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground tracking-tight text-[13px] font-medium uppercase">Share</span>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <button type="button" className="inline-flex">
                            <Info className="w-3.5 h-3.5 text-muted-foreground/50 hover:text-muted-foreground cursor-help transition-colors" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-[13px] leading-relaxed">
                            <span className="font-medium">Share of Mentions (%)</span> represents the approximate weight of this keyword among all conceptual associations with the brand.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-muted-foreground tracking-tight text-[13px] font-medium uppercase">Explanation</th>
                </tr>
              </thead>
              <tbody>
                {keywordData.map((item, index) => (
                  <tr 
                    key={index}
                    className="border-b border-border/50 hover:bg-muted/50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      <span className="text-foreground tracking-tight text-[15px]">{item.keyword}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`tracking-tight font-medium text-[15px] ${getVisibilityColor(item.visibility)}`}>
                        {item.visibility}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getTrendIcon(item.trend)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`tracking-tight text-[14px] ${getToneColor(item.tone)}`}>
                        {item.tone}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-muted-foreground tracking-tight text-[15px]">{item.share}%</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-muted-foreground tracking-tight leading-relaxed text-[14px]">
                        {item.explanation}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Methodology */}
        {keywordAnalysisData?.methodology && (
          <div className="p-6 rounded-xl border border-border bg-card">
            <h3 className="text-foreground mb-4 tracking-tight text-[15px] font-medium">Methodology</h3>
            <p className="text-muted-foreground leading-relaxed text-[15px]">
              {keywordAnalysisData.methodology}
            </p>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
