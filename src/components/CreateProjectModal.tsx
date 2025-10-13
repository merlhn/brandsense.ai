import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { AlertCircle, Loader2, CheckCircle, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";
import { API_CONFIG } from "../lib/api";
import { storage } from "../lib/storage";
import { logger } from "../lib/logger";
import { SCREENS } from "../lib/constants";
import { toast } from "sonner@2.0.3";
import { Project } from "../lib/types";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
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

export function CreateProjectModal({ isOpen, onClose, onProjectCreated, onNavigate }: CreateProjectModalProps) {
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
        websiteUrl: websiteUrlError || undefined
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
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROJECTS.CREATE}`,
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

      // Call the parent handler
      onProjectCreated(data.project);
      
      // Reset form
      setBrandName("");
      setMarket("United States");
      setLanguage("English");
      setIndustry("");
      setWebsiteUrl("");
      setDescription("");
      setValidationErrors({});
      setError("");

      logger.success('Project created successfully!');
      toast.success('Project Created! 🎉', {
        description: `${brandName} is now being analyzed. Click Refresh Dashboard in 2-3 minutes to see your data.`,
        duration: 6000,
      });

    } catch (error) {
      console.error('Error creating project:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Create New Project
          </DialogTitle>
          <DialogDescription>
            Set up a new brand monitoring project to track your brand's visibility and sentiment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Brand Information */}
          <div className="space-y-4">
            <div>
              <h3 className="text-foreground tracking-tight mb-3 text-[15px] font-medium">
                Brand Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brandName" className="text-[13px] font-medium">
                    Brand Name *
                  </Label>
                  <Input
                    id="brandName"
                    value={brandName}
                    onChange={handleBrandNameChange}
                    placeholder="e.g., Nike, Apple, Tesla"
                    className={validationErrors.brandName ? "border-destructive" : ""}
                  />
                  {validationErrors.brandName && (
                    <p className="text-destructive text-[12px]">{validationErrors.brandName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="market" className="text-[13px] font-medium">
                    Market *
                  </Label>
                  <select
                    id="market"
                    value={market}
                    onChange={(e) => setMarket(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {MARKETS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language" className="text-[13px] font-medium">
                    Language *
                  </Label>
                  <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-[13px] font-medium">
                    Industry
                  </Label>
                  <Input
                    id="industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g., Technology, Fashion, Automotive"
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Additional Information */}
          <div className="space-y-4">
            <div>
              <h3 className="text-foreground tracking-tight mb-3 text-[15px] font-medium">
                Additional Information
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="websiteUrl" className="text-[13px] font-medium">
                    Website URL
                  </Label>
                  <Input
                    id="websiteUrl"
                    value={websiteUrl}
                    onChange={handleWebsiteUrlChange}
                    placeholder="https://example.com"
                    className={validationErrors.websiteUrl ? "border-destructive" : ""}
                  />
                  {validationErrors.websiteUrl && (
                    <p className="text-destructive text-[12px]">{validationErrors.websiteUrl}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-[13px] font-medium">
                    Description
                  </Label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of your brand or project..."
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px] resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !brandName.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
