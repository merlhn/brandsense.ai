import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
import { AlertCircle, Building2, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { API_CONFIG } from "../lib/api";
import { storage } from "../lib/storage";
import { logger } from "../lib/logger";
import { SCREENS } from "../lib/constants";

interface SignUpProps {
  onNavigate?: (screen: string) => void;
}

export function SignUp({ onNavigate }: SignUpProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (emailValue: string) => {
    if (!emailValue) {
      setEmailError('');
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      setEmailError('Please enter a valid email address.');
    } else {
      setEmailError('');
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  const handleSubmit = async () => {
    // Validate inputs
    if (!email || !email.includes('@')) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    if (!fullName.trim()) {
      setGeneralError('Please enter your full name');
      return;
    }

    if (password.length < 8) {
      setGeneralError('Password must be at least 8 characters');
      return;
    }

    if (!agreedToTerms) {
      setGeneralError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    setGeneralError('');
    setIsLoading(true);

    // 🧹 CRITICAL: Clear any stale data before creating new account
    logger.cleanup('Clearing storage before signup...');
    storage.clearAll();

    try {
      // Call Supabase Edge Function for signup
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.SIGNUP}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            email: email.toLowerCase().trim(),
            password,
            fullName: fullName.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 409) {
          // Email already exists - 409 Conflict
          setGeneralError('This email is already registered. Please sign in instead.');
        } else if (response.status === 500 && data.error?.includes('Database schema')) {
          setGeneralError('⚠️ System setup incomplete. Please contact support.');
          console.error('CRITICAL: Database schema not deployed!', data);
        } else if (data.error?.includes('already registered') || data.error?.includes('already exists') || data.error?.includes('email is already registered')) {
          setGeneralError('This email is already registered. Please sign in instead.');
        } else {
          setGeneralError(data.error || 'Failed to create account. Please try again.');
        }
        setIsLoading(false);
        return;
      }

      if (!data.success) {
        setGeneralError('Account creation failed. Please try again.');
        setIsLoading(false);
        return;
      }

      // Now automatically sign in to get access token
      try {
        const signInResponse = await fetch(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.SIGNIN}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              email: email.toLowerCase().trim(),
              password,
            }),
          }
        );

        const signInData = await signInResponse.json();

        if (signInResponse.ok && signInData.success && signInData.accessToken) {
          // Store access token and user info
          storage.setAccessToken(signInData.accessToken);
          storage.setUserEmail(email.toLowerCase().trim());
          storage.setUserFullName(fullName.trim());

          // Show welcome toast
          toast.success('Welcome to Brand Sense! 🎉', {
            description: "Let's set up your first brand monitoring project.",
            duration: 4000,
          });

          // Success - redirect to create first project
          setIsLoading(false);
          onNavigate?.(SCREENS.CREATE_PROJECT);
        } else {
          // Sign up succeeded but auto sign-in failed - redirect to sign in
          logger.warning('Auto sign-in failed after signup. Please sign in manually.');
          setGeneralError('Account created! Please sign in to continue.');
          setIsLoading(false);
          setTimeout(() => {
            onNavigate?.(SCREENS.SIGN_IN);
          }, 2000);
        }
      } catch (signInError) {
        logger.error('Auto sign-in error:', signInError);
        setGeneralError('Account created! Please sign in to continue.');
        setIsLoading(false);
        setTimeout(() => {
          onNavigate?.('signin');
        }, 2000);
      }

    } catch (error) {
      console.error('Sign up error:', error);
      setGeneralError('Network error. Please check your connection and try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[400px] mx-auto">
      {/* Back Button */}
      <button
        onClick={() => onNavigate?.('landing')}
        disabled={isLoading}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="tracking-tight">Back</span>
      </button>

      <div className="mb-10">
        <h1 className="mb-3 text-foreground tracking-tight">Create Account</h1>
        <p className="text-muted-foreground">
          Start monitoring your brand in ChatGPT
        </p>
      </div>

      <div className="space-y-4">
        {/* Google Sign Up - Disabled for corporate requirement */}
        <Button 
          variant="outline" 
          disabled
          className="w-full h-11 bg-card border-border opacity-50 cursor-not-allowed"
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google (Not Available)
        </Button>

        <div className="relative my-6">
          <Separator className="bg-border" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-background px-3 text-muted-foreground uppercase tracking-wider">or</span>
          </div>
        </div>

        {/* General Error */}
        {generalError && (
          <div className="mb-4 p-4 border border-destructive/50 rounded-lg bg-destructive/10 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-destructive">{generalError}</p>
              {generalError.includes('already registered') && (
                <button 
                  onClick={() => onNavigate?.('signin')}
                  className="text-primary hover:text-primary/80 transition-colors mt-2 underline block"
                >
                  Go to Sign In →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Email/Password Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signup-fullname" className="text-foreground">Full Name</Label>
            <Input 
              id="signup-fullname" 
              type="text" 
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}
              className="h-11 bg-card border-border focus:border-primary transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-email" className="text-foreground">Email</Label>
            <Input 
              id="signup-email" 
              type="email" 
              placeholder="john@example.com"
              value={email}
              onChange={handleEmailChange}
              disabled={isLoading}
              className={`h-11 bg-card transition-colors ${
                emailError 
                  ? 'border-destructive focus:border-destructive' 
                  : 'border-border focus:border-primary'
              }`}
            />
            {emailError && (
              <div className="flex items-start gap-2 text-destructive mt-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p className="text-sm">{emailError}</p>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="signup-password" className="text-foreground">Password</Label>
            <Input 
              id="signup-password" 
              type="password" 
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="h-11 bg-card border-border focus:border-primary transition-colors"
            />
            <p className="text-muted-foreground mt-1">
              Must be at least 8 characters
            </p>
          </div>

          <div className="flex items-start space-x-3 pt-2">
            <Checkbox 
              id="gdpr" 
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
              disabled={isLoading}
              className="mt-1 border-border" 
            />
            <label
              htmlFor="gdpr"
              className="text-muted-foreground cursor-pointer leading-relaxed"
            >
              I agree to the{" "}
              <button className="text-foreground hover:text-primary transition-colors">
                Terms of Service
              </button>{" "}
              and{" "}
              <button className="text-foreground hover:text-primary transition-colors">
                Privacy Policy
              </button>
            </label>
          </div>

          <Button 
            onClick={handleSubmit}
            disabled={!!emailError || !email || !fullName || !password || !agreedToTerms || isLoading}
            className="w-full h-11 mt-6 bg-primary hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </div>

        <div className="text-center mt-8 pt-6 border-t border-border">
          <span className="text-muted-foreground">Already have an account? </span>
          <button 
            onClick={() => onNavigate?.('signin')}
            className="text-foreground hover:text-primary transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}