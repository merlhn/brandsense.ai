# 🤖 ChatGPT Response Parsing Guide

## ⚠️ CRITICAL: Why Parsing Matters

Frontend dashboard components expect **EXACT structured JSON format**. ChatGPT returns **unstructured text**. Backend MUST parse and validate responses before storing.

**❌ Wrong Approach:**
```javascript
// DON'T DO THIS - Frontend can't parse unstructured text
const chatGPTResponse = await openai.chat.completions.create(...);
database.store(chatGPTResponse.choices[0].message.content); // Raw text!
```

**✅ Correct Approach:**
```javascript
// Backend parses ChatGPT response into structured format
const chatGPTResponse = await openai.chat.completions.create(...);
const parsedData = parseToStructuredFormat(chatGPTResponse);
validateAgainstSchema(parsedData); // Ensure it matches frontend types
database.store(parsedData); // Clean, structured JSON
```

---

## 📊 Required Output Formats

### 1. Brand Identity Analysis

**Frontend expects this EXACT structure** (see `/lib/types.ts` lines 33-60):

```typescript
interface BrandIdentityData {
  bpmData: BPMMetric[];              // 4 metrics
  totalBPM: number;                  // Average of all BPM scores
  toneData: ToneMetric[];            // 6 tone traits
  brandPowerStatement: string;       // HTML allowed (use <strong>)
  brandIdentitySummary: string;      // HTML allowed (use <strong>)
  dominantThemes: DominantTheme[];   // 3 themes
  coreBrandPersona: string;          // Persona description
  keyAssociations: string[];         // 10 key associations
}
```

**Example JSON:**
```json
{
  "bpmData": [
    {
      "name": "Visibility",
      "score": 86,
      "description": "How often and prominently the brand appears across LLM-generated contexts."
    },
    {
      "name": "Consistency",
      "score": 82,
      "description": "How coherent its tone, values, and messaging appear across topics."
    },
    {
      "name": "Emotional Resonance",
      "score": 78,
      "description": "How strongly the brand evokes emotional or cultural reactions."
    },
    {
      "name": "Distinctiveness",
      "score": 84,
      "description": "How clearly it stands out from category-level or generic mentions."
    }
  ],
  "totalBPM": 82.5,
  "toneData": [
    {
      "trait": "Innovation",
      "fullName": "Innovation",
      "score": 85
    },
    {
      "trait": "Trust",
      "fullName": "Trust / Reliability",
      "score": 74
    },
    {
      "trait": "Accessibility",
      "fullName": "Accessibility / Mass Appeal",
      "score": 77
    },
    {
      "trait": "Prestige",
      "fullName": "Prestige / Premium Feel",
      "score": 80
    },
    {
      "trait": "Activism",
      "fullName": "Activism / Social Responsibility",
      "score": 88
    },
    {
      "trait": "Performance",
      "fullName": "Performance / Technical Expertise",
      "score": 90
    }
  ],
  "brandPowerStatement": "Nike's AI presence in the Turkish market reflects a brand with exceptionally strong brand power...",
  "brandIdentitySummary": "Nike is positioned as a <strong>sport-performance cultural icon</strong> in LLMs...",
  "dominantThemes": [
    {
      "title": "Hero (Kahraman)",
      "description": "Nike primarily positions itself as the brand that encourages and strengthens customers...",
      "impact": "Very High"
    },
    {
      "title": "Performance & Sports Culture",
      "description": "The brand identity is conveyed through deeply rooted associations with sports achievements...",
      "impact": "High"
    },
    {
      "title": "Innovation Leadership",
      "description": "Positioning is articulated through an innovative discourse...",
      "impact": "High"
    }
  ],
  "coreBrandPersona": "Nike is frequently portrayed by ChatGPT as a brand that encourages its audience...",
  "keyAssociations": [
    "Sports performance",
    "Innovation",
    "Just Do It",
    "Athletic footwear",
    "Basketball heritage",
    "Running technology",
    "Athlete endorsements",
    "Lifestyle culture",
    "Premium quality",
    "Global brand"
  ]
}
```

---

### 2. Sentiment Analysis

**Frontend expects this EXACT structure** (see `/lib/types.ts` lines 63-89):

```typescript
interface SentimentAnalysisData {
  overallSummary: string;
  primarySentiments: PrimarySentiment[];      // 4 categories
  emotionalClusters: EmotionalCluster[];      // Multiple clusters
  sentimentProfile: SentimentDimension[];     // Multiple dimensions
}
```

**Example JSON:**
```json
{
  "overallSummary": "Nike enjoys predominantly positive sentiment in the Turkish market, with 72% positive mentions...",
  "primarySentiments": [
    {
      "category": "Positive",
      "score": 72,
      "colorType": "success",
      "themes": "Quality, Innovation, Performance, Style"
    },
    {
      "category": "Neutral",
      "score": 18,
      "colorType": "primary",
      "themes": "Price comparisons, Product availability"
    },
    {
      "category": "Negative",
      "score": 8,
      "colorType": "destructive",
      "themes": "Pricing concerns, Counterfeit products"
    },
    {
      "category": "Mixed",
      "score": 2,
      "colorType": "foreground",
      "themes": "Sustainability efforts, Labor practices"
    }
  ],
  "emotionalClusters": [
    {
      "name": "Excitement",
      "score": 85,
      "explanation": "Strong association with sports achievements and product launches."
    },
    {
      "name": "Trust",
      "score": 78,
      "explanation": "Long-standing reputation and consistent quality delivery."
    },
    {
      "name": "Aspiration",
      "score": 82,
      "explanation": "Brand represents achievement and personal excellence."
    }
  ],
  "sentimentProfile": [
    {
      "dimension": "Trust (Güven)",
      "score": 80,
      "trend": "up",
      "themes": "Reliability, Quality, Heritage",
      "summary": "Nike is trusted for consistent quality and authentic products."
    },
    {
      "dimension": "Innovation (Yenilik)",
      "score": 88,
      "trend": "stable",
      "themes": "Technology, Design, Performance",
      "summary": "Strong perception as an innovative leader in sportswear technology."
    },
    {
      "dimension": "Value (Değer)",
      "score": 65,
      "trend": "down",
      "themes": "Pricing, Affordability, Worth",
      "summary": "Price concerns exist but are balanced by perceived quality."
    }
  ]
}
```

**Important Notes:**
- `primarySentiments` must have exactly 4 categories: Positive, Neutral, Negative, Mixed
- `colorType` must be: 'success' | 'primary' | 'destructive' | 'foreground'
- `trend` must be: 'up' | 'stable' | 'down'
- Total of `primarySentiments.score` should be ~100

---

### 3. Keyword Analysis

**Frontend expects this EXACT structure** (see `/lib/types.ts` lines 92-104):

```typescript
interface KeywordAnalysisData {
  summary: string;
  keywords: KeywordMetric[];
}
```

**Example JSON:**
```json
{
  "summary": "Nike's visibility is dominated by sports-related keywords, with 'running' and 'basketball' accounting for 25% of total mentions...",
  "keywords": [
    {
      "keyword": "running",
      "visibility": 95,
      "trend": "up",
      "tone": "Positive",
      "share": 12.5,
      "explanation": "Primary category association, strongly linked to Pegasus and Air Zoom lines."
    },
    {
      "keyword": "basketball",
      "visibility": 92,
      "trend": "stable",
      "tone": "Positive",
      "share": 11.2,
      "explanation": "Jordan brand heritage and current NBA partnerships drive consistent mentions."
    },
    {
      "keyword": "innovation",
      "visibility": 88,
      "trend": "up",
      "tone": "Positive",
      "share": 10.3,
      "explanation": "Associated with product launches and technology developments."
    },
    {
      "keyword": "pricing",
      "visibility": 65,
      "trend": "down",
      "tone": "Negative",
      "share": 5.8,
      "explanation": "Concerns about affordability in Turkish market."
    }
  ]
}
```

**Important Notes:**
- `visibility` is 0-100 score
- `trend` must be: 'up' | 'stable' | 'down'
- `tone` must be: 'Positive' | 'Neutral' | 'Negative'
- `share` is percentage (0-100)
- Include 10-15 keywords minimum

---

### 4. Risk Report

**Frontend expects Markdown** (see `/lib/types.ts` lines 110-120):

```typescript
interface RiskReport {
  id: string;
  projectId: string;
  createdAt: string;
  language: 'Turkish' | 'English';
  dateRange: { start: string; end: string };
  content: string; // Markdown format
}
```

**Example Markdown:**
```markdown
# Nike Turkey - Brand Risk Report

## Executive Summary

Nike maintains strong brand health in the Turkish market with minimal critical risks. Primary concerns center around pricing perception and competitive pressure from local brands.

## Risk Areas

### 1. Pricing Perception (Medium Risk)
**Severity:** 6/10  
**Trend:** Increasing

Turkish consumers increasingly perceive Nike products as overpriced compared to local alternatives. This is particularly pronounced in the running category.

**Recommendations:**
- Launch mid-tier product lines for price-sensitive segments
- Emphasize value proposition through quality and durability messaging
- Strategic promotions during economic downturns

### 2. Counterfeit Products (Medium Risk)
**Severity:** 5/10  
**Trend:** Stable

Counterfeit Nike products are prevalent in both online and offline channels, diluting brand trust.

**Recommendations:**
- Partner with e-commerce platforms for authentication
- Launch awareness campaigns about genuine product verification
- Strengthen authorized retailer network

### 3. Sustainability Concerns (Low Risk)
**Severity:** 3/10  
**Trend:** Emerging

Growing consumer awareness about environmental impact, though not yet a major purchase factor.

**Recommendations:**
- Communicate existing sustainability initiatives more prominently
- Launch localized recycling programs
- Highlight eco-friendly product lines

## Overall Risk Score: 4.7/10

Nike's brand health in Turkey remains strong with no critical immediate threats. Focus areas should be pricing strategy and counterfeit prevention.
```

---

## 🛠️ Implementation Strategy

### Option 1: Force JSON Mode (Recommended)

**Modify ChatGPT prompts to explicitly request JSON:**

```javascript
const prompt = `
Analyze Nike's brand identity in the Turkish market.

YOU MUST RESPOND WITH VALID JSON ONLY. Use this exact structure:

{
  "bpmData": [
    {"name": "Visibility", "score": 0-100, "description": "..."},
    {"name": "Consistency", "score": 0-100, "description": "..."},
    {"name": "Emotional Resonance", "score": 0-100, "description": "..."},
    {"name": "Distinctiveness", "score": 0-100, "description": "..."}
  ],
  "totalBPM": average of all BPM scores,
  "toneData": [
    {"trait": "Innovation", "fullName": "Innovation", "score": 0-100},
    {"trait": "Trust", "fullName": "Trust / Reliability", "score": 0-100},
    ... (6 total)
  ],
  "brandPowerStatement": "...",
  "brandIdentitySummary": "...",
  "dominantThemes": [
    {"title": "...", "description": "...", "impact": "High/Medium/Low"}
  ],
  "coreBrandPersona": "...",
  "keyAssociations": ["...", "..."] (10 items)
}

Brand: Nike
Market: Turkey
Language: Turkish
Timeframe: Last 3 months
`;

const completion = await openai.chat.completions.create({
  model: "gpt-4-turbo-preview",
  messages: [
    { role: "system", content: "You are a brand analyst. Always respond with valid JSON only." },
    { role: "user", content: prompt }
  ],
  response_format: { type: "json_object" } // Force JSON
});

const parsed = JSON.parse(completion.choices[0].message.content);
```

### Option 2: Structured Output (GPT-4+ Only)

```javascript
const completion = await openai.chat.completions.create({
  model: "gpt-4-turbo-preview",
  messages: [...],
  functions: [
    {
      name: "analyzeBrandIdentity",
      description: "Analyze brand identity",
      parameters: {
        type: "object",
        properties: {
          bpmData: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                score: { type: "number" },
                description: { type: "string" }
              }
            }
          },
          // ... define all fields
        },
        required: ["bpmData", "totalBPM", "toneData", ...]
      }
    }
  ],
  function_call: { name: "analyzeBrandIdentity" }
});
```

### Option 3: Manual Parsing (Not Recommended)

If ChatGPT returns unstructured text, you'll need custom parsing logic:

```javascript
function parseBrandIdentityResponse(text) {
  // Extract BPM scores using regex
  const visibilityMatch = text.match(/Visibility[:\s]+(\d+)/i);
  const visibility = visibilityMatch ? parseInt(visibilityMatch[1]) : 0;
  
  // ... parse all fields
  
  return {
    bpmData: [...],
    totalBPM: ...,
    // etc
  };
}
```

**⚠️ WARNING:** Manual parsing is fragile and error-prone. Use JSON mode!

---

## ✅ Validation Requirements

Before storing to database, validate:

```javascript
function validateBrandIdentityData(data) {
  // Required fields
  assert(data.bpmData.length === 4, "Must have 4 BPM metrics");
  assert(data.toneData.length === 6, "Must have 6 tone metrics");
  assert(data.dominantThemes.length >= 3, "Must have at least 3 themes");
  assert(data.keyAssociations.length >= 10, "Must have at least 10 associations");
  
  // Score ranges
  data.bpmData.forEach(metric => {
    assert(metric.score >= 0 && metric.score <= 100, "BPM scores must be 0-100");
  });
  
  // Calculate totalBPM
  const calculatedBPM = data.bpmData.reduce((sum, m) => sum + m.score, 0) / 4;
  assert(Math.abs(data.totalBPM - calculatedBPM) < 1, "totalBPM must match average");
  
  return true;
}
```

---

## 🔄 Data Flow

```
1. User creates project
   ↓
2. Backend triggers ChatGPT analysis
   ↓
3. ChatGPT returns response (JSON or text)
   ↓
4. Backend parses response → structured format
   ↓
5. Backend validates against schema
   ↓
6. Backend stores in database (project_data table)
   ↓
7. Frontend fetches structured data
   ↓
8. Dashboard components render perfectly ✅
```

---

## 📝 Updated Prompts

Copy these updated prompts to `/lib/api.ts`:

### Brand Identity Prompt (JSON Mode)

```typescript
export function getBrandIdentityPromptJSON(
  brandName: string,
  location: string,
  language: string,
  timeframe: string
): string {
  return `Analyze ${brandName}'s brand identity in ${location} (${language}) over ${timeframe}.

RESPOND WITH VALID JSON ONLY. Use this exact structure:

{
  "bpmData": [
    {"name": "Visibility", "score": 0-100, "description": "How often and prominently the brand appears"},
    {"name": "Consistency", "score": 0-100, "description": "How coherent its messaging appears"},
    {"name": "Emotional Resonance", "score": 0-100, "description": "How strongly it evokes emotions"},
    {"name": "Distinctiveness", "score": 0-100, "description": "How clearly it stands out"}
  ],
  "totalBPM": (average of 4 BPM scores),
  "toneData": [
    {"trait": "Innovation", "fullName": "Innovation", "score": 0-100},
    {"trait": "Trust", "fullName": "Trust / Reliability", "score": 0-100},
    {"trait": "Accessibility", "fullName": "Accessibility / Mass Appeal", "score": 0-100},
    {"trait": "Prestige", "fullName": "Prestige / Premium Feel", "score": 0-100},
    {"trait": "Activism", "fullName": "Activism / Social Responsibility", "score": 0-100},
    {"trait": "Performance", "fullName": "Performance / Technical Expertise", "score": 0-100}
  ],
  "brandPowerStatement": "2-3 sentence summary (can include <strong> tags)",
  "brandIdentitySummary": "Detailed paragraph (can include <strong> tags)",
  "dominantThemes": [
    {"title": "Theme 1", "description": "Detailed explanation", "impact": "High/Medium/Low"},
    {"title": "Theme 2", "description": "Detailed explanation", "impact": "High/Medium/Low"},
    {"title": "Theme 3", "description": "Detailed explanation", "impact": "High/Medium/Low"}
  ],
  "coreBrandPersona": "Paragraph describing brand persona",
  "keyAssociations": ["association1", "association2", ... (10 items)]
}

Analyze in ${language} language. Be specific to ${location} market.`;
}
```

---

## 🎯 Success Criteria

Backend parsing is correct when:

- ✅ ChatGPT response is valid JSON
- ✅ All required fields are present
- ✅ All scores are 0-100 range
- ✅ Arrays have correct lengths
- ✅ Validation passes without errors
- ✅ Frontend dashboard renders without modifications
- ✅ No null/undefined values in critical fields

---

## 🐛 Common Issues

### Issue: ChatGPT returns text instead of JSON

**Solution:** Use `response_format: { type: "json_object" }` and update prompts

### Issue: JSON is valid but structure is wrong

**Solution:** Be very explicit in prompt about field names and types

### Issue: Scores outside 0-100 range

**Solution:** Add validation and clamp values: `Math.max(0, Math.min(100, score))`

### Issue: Missing fields

**Solution:** Provide defaults in backend before storing

```javascript
const defaultBrandIdentity = {
  bpmData: [
    { name: "Visibility", score: 0, description: "..." },
    // ... etc
  ],
  // ... all required fields
};

const finalData = { ...defaultBrandIdentity, ...parsedData };
```

---

## 📚 Reference Files

- **Type Definitions:** `/lib/types.ts` (lines 33-104)
- **Frontend Components:** 
  - `/components/BrandIdentity.tsx`
  - `/components/SentimentAnalysis.tsx`
  - `/components/KeywordAnalysis.tsx`
- **Current Prompts:** `/lib/api.ts` (lines 223-334)

---

**CRITICAL:** Backend MUST parse ChatGPT responses into exact structured formats. Frontend cannot and will not parse unstructured text!
