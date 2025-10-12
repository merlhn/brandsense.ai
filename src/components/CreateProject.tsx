import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { AlertCircle, Loader2, CheckCircle, Sparkles } from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { storage } from "../lib/storage";
import { logger } from "../lib/logger";
import { SCREENS } from "../lib/constants";
import { toast } from "sonner@2.0.3";

interface CreateProjectProps {
  onNavigate?: (screen: string) => void;
}

// Markets list - same as backend validation
const MARKETS = [
  "United States",
  "United Kingdom", 
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Netherlands",
  "Turkey",
  "Japan",
  "South Korea",
  "Brazil",
  "Mexico",
  "India",
  "Global"
];

// Languages list - same as backend validation
const LANGUAGES = [
  "English",
  "Turkish",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Japanese",
  "Korean",
  "Chinese",
  "Hindi",
  "Dutch"
];

export function CreateProject({ onNavigate }: CreateProjectProps) {
  const [brandName, setBrandName] = useState("");
  const [market, setMarket] = useState("United States");
  const [language, setLanguage] = useState("English");
  const [industry, setIndustry] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [description, setDescription] = useState("");
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    brandName?: string;
    websiteUrl?: string;
  }>({});

  const validateBrandName = (name: string): string | null => {
    if (!name.trim()) {
      return "Brand name is required";
    }
    if (name.trim().length < 2) {
      return "Brand name must be at least 2 characters";
    }
    if (name.trim().length > 100) {
      return "Brand name must be less than 100 characters";
    }
    return null;
  };

  const validateWebsiteUrl = (url: string): string | null => {
    if (!url.trim()) return null; // Optional field
    
    try {
      const urlObj = new URL(url);
      if (!urlObj.protocol.startsWith('http')) {
        return "Website URL must start with http:// or https://";
      }
      return null;
    } catch {
      return "Please enter a valid website URL";
    }
  };

  const handleBrandNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBrandName(value);
    
    const error = validateBrandName(value);
    setValidationErrors(prev => ({
      ...prev,
      brandName: error || undefined
    }));
  };

  const handleWebsiteUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWebsiteUrl(value);
    
    const error = validateWebsiteUrl(value);
    setValidationErrors(prev => ({
      ...prev,
      websiteUrl: error || undefined
    }));
  };

  const handleSubmit = async () => {
    // Validate all fields
    const brandNameError = validateBrandName(brandName);
    const websiteUrlError = validateWebsiteUrl(websiteUrl);
    
    if (brandNameError || websiteUrlError) {
      setValidationErrors({
        brandName: brandNameError || undefined,
        websiteUrl: websiteUrlError || undefined,
      });
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const accessToken = storage.getAccessToken();
      if (!accessToken) {
        setError("Session expired. Please sign in again.");
        setIsLoading(false);
        onNavigate?.(SCREENS.SIGN_IN);
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cf9a9609/projects/create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            name: brandName.trim(),
            market: market.trim(),
            language: language.trim(),
            industry: industry.trim() || undefined,
            websiteUrl: websiteUrl.trim() || undefined,
            description: description.trim() || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setError("Session expired. Please sign in again.");
          setTimeout(() => {
            onNavigate?.(SCREENS.SIGN_IN);
          }, 2000);
        } else {
          setError(data.error || 'Failed to create project. Please try again.');
        }
        setIsLoading(false);
        return;
      }

      if (!data.success || !data.project) {
        setError('Failed to create project. Please try again.');
        setIsLoading(false);
        return;
      }

      // Store project in localStorage
      storage.saveProject(data.project);
      storage.setCurrentProject(data.project);

      // Trigger storage event to update DashboardLayout
      window.dispatchEvent(new Event('storage'));

      logger.success('Project created successfully!');
      toast.success('Project Created! 🎉', {
        description: `${brandName} is now being analyzed. Click Refresh Dashboard in 2-3 minutes to see your data.`,
        duration: 6000,
      });

      // Navigate to dashboard
      setIsLoading(false);
      onNavigate?.(SCREENS.DASHBOARD);

    } catch (error) {
      logger.error('Error creating project:', error);
      setError('Network error. Please check your connection and try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[600px] mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-foreground tracking-tight">Create Your First Project</h1>
        </div>
        <p className="text-muted-foreground">
          Tell us about your brand so we can analyze its visibility in ChatGPT
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 border border-destructive/50 rounded-lg bg-destructive/10 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
          <p className="text-destructive">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Brand Name */}
        <div className="space-y-2">
          <Label htmlFor="brandName" className="text-foreground">
            Brand Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="brandName"
            type="text"
            placeholder="e.g., Nike, Apple, Tesla"
            value={brandName}
            onChange={handleBrandNameChange}
            disabled={isLoading}
            className={`h-11 bg-card border-border transition-colors ${
              validationErrors.brandName
                ? 'border-destructive focus:border-destructive'
                : 'focus:border-primary'
            }`}
          />
          {validationErrors.brandName && (
            <p className="text-destructive tracking-tight flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              {validationErrors.brandName}
            </p>
          )}
        </div>

        {/* Market & Language - Two columns */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="market" className="text-foreground">
              Market <span className="text-destructive">*</span>
            </Label>
            <select
              id="market"
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              disabled={isLoading}
              className="w-full h-11 px-3 rounded-lg bg-card border border-border text-foreground focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {MARKETS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language" className="text-foreground">
              Language <span className="text-destructive">*</span>
            </Label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={isLoading}
              className="w-full h-11 px-3 rounded-lg bg-card border border-border text-foreground focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        <Separator className="bg-border" />

        {/* Optional Fields Section */}
        <div>
          <h3 className="text-foreground tracking-tight mb-1">Additional Information</h3>
          <p className="text-muted-foreground tracking-tight mb-4">
            Optional - Helps improve analysis accuracy
          </p>

          <div className="space-y-4">
            {/* Industry */}
            <div className="space-y-2">
              <Label htmlFor="industry" className="text-foreground">Industry</Label>
              <Input
                id="industry"
                type="text"
                placeholder="e.g., Technology, Fashion, Automotive"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                disabled={isLoading}
                className="h-11 bg-card border-border focus:border-primary transition-colors"
              />
            </div>

            {/* Website URL */}
            <div className="space-y-2">
              <Label htmlFor="websiteUrl" className="text-foreground">Website URL</Label>
              <Input
                id="websiteUrl"
                type="url"
                placeholder="https://example.com"
                value={websiteUrl}
                onChange={handleWebsiteUrlChange}
                disabled={isLoading}
                className={`h-11 bg-card border-border transition-colors ${
                  validationErrors.websiteUrl
                    ? 'border-destructive focus:border-destructive'
                    : 'focus:border-primary'
                }`}
              />
              {validationErrors.websiteUrl && (
                <p className="text-destructive tracking-tight flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {validationErrors.websiteUrl}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground">Brand Description</Label>
              <textarea
                id="description"
                placeholder="Brief description of your brand and what it does..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground focus:border-primary transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !brandName.trim() || !!validationErrors.brandName || !!validationErrors.websiteUrl}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-150"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Creating Project...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Create Project & Start Analysis
            </>
          )}
        </Button>

        {/* Info Message */}
        <div className="p-4 border border-primary/20 rounded-lg bg-primary/5">
          <p className="text-muted-foreground tracking-tight">
            <CheckCircle className="w-4 h-4 inline mr-2 text-primary" />
            Analysis will start automatically and takes 2-3 minutes to complete
          </p>
        </div>
      </div>
    </div>
  );
}
