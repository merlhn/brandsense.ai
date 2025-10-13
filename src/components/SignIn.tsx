import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { API_CONFIG } from "../lib/api";
import { storage } from "../lib/storage";
import { logger } from "../lib/logger";
import { SCREENS } from "../lib/constants";

interface SignInProps {
  onNavigate?: (screen: string) => void;
}

export function SignIn({ onNavigate }: SignInProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }

    setError('');
    setIsLoading(true);

    // CRITICAL: Clear ALL storage data BEFORE attempting sign in
    // This prevents stale project IDs from previous users
    logger.cleanup('Clearing all storage data before sign in...');
    storage.clearAll();
    
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.SIGNIN}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0bmdsdWJmb3l2Znd1eHhidWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NzkzMjksImV4cCI6MjA3NTI1NTMyOX0.gwLdjaddi_56cL3p0IDiMb0TTJRA56B1e7d3NPmeXVQ'}`,
          },
          body: JSON.stringify({
            email: email.toLowerCase().trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 401) {
          // Clear any stale storage data on auth failure
          logger.cleanup('Authentication failed - clearing stale storage data');
          storage.clearAll();
          
          if (data.error?.includes('check your credentials or sign up')) {
            setError('Invalid email or password. If you don\'t have an account, please sign up first.');
          } else {
            setError(data.error || 'Invalid email or password. Please check your credentials.');
          }
        } else {
          setError(data.error || 'Sign in failed. Please try again.');
        }
        setIsLoading(false);
        return;
      }

      if (!data.success || !data.accessToken) {
        setError('Sign in failed. Please try again.');
        setIsLoading(false);
        return;
      }

      // Store user info for later restoration
      const userEmail = data.user.email;
      const userFullName = data.user.fullName || '';
      
      // Store access token and user info
      storage.setAccessToken(data.accessToken);
      storage.setUserEmail(userEmail);
      if (userFullName) {
        storage.setUserFullName(userFullName);
      }

      // Fetch real projects from backend to sync with storage
      logger.sync('Fetching projects from backend...');
      try {
        const projectsResponse = await fetch(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROJECTS.LIST}`,
          {
            headers: {
              'Authorization': `Bearer ${data.accessToken}`,
            },
          }
        );

        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          const backendProjects = projectsData.projects || [];
          
          logger.success(`Fetched ${backendProjects.length} projects from backend`);
          
          // Sync storage with backend - backend is source of truth
          if (backendProjects.length > 0) {
            storage.clearAllAndRestoreAuth(data.accessToken, userEmail, userFullName);
            storage.syncProjectsFromBackend(backendProjects);
            logger.success('User has projects, redirecting to dashboard');
            
            // Show welcome toast
            toast.success('Welcome back!', {
              description: `You have ${backendProjects.length} project${backendProjects.length > 1 ? 's' : ''}. Click Refresh to load the latest data.`,
              duration: 5000,
            });
            
            setIsLoading(false);
            onNavigate?.(SCREENS.DASHBOARD);
          } else {
            // Clear any stale storage and restore auth with user info
            storage.clearAllAndRestoreAuth(data.accessToken, userEmail, userFullName);
            logger.info('No projects found - user can view dashboard (admin will create projects)');
            
            // Show welcome toast for new user
            toast.success('Welcome to Brand Sense!', {
              description: 'Get started by creating your first project to monitor your brand.',
              duration: 5000,
            });
            
            setIsLoading(false);
            onNavigate?.(SCREENS.DASHBOARD);
          }
        } else {
          logger.error('Failed to fetch projects from backend');
          // DO NOT fallback to storage - always use backend as source of truth
          // Clear storage and redirect to dashboard
          storage.clearAllAndRestoreAuth(data.accessToken);
          logger.info('Backend fetch failed, redirecting to dashboard');
          setIsLoading(false);
          onNavigate?.(SCREENS.DASHBOARD);
        }
      } catch (fetchError) {
        logger.error('Error fetching projects:', fetchError);
        // DO NOT fallback to storage - backend is source of truth
        // Clear storage and redirect to dashboard
        storage.clearAllAndRestoreAuth(data.accessToken);
        logger.info('Network error, redirecting to dashboard');
        setIsLoading(false);
        onNavigate?.(SCREENS.DASHBOARD);
      }

    } catch (error) {
      logger.error('Sign in error:', error);
      setError('Network error. Please check your connection and try again.');
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit();
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
        <h1 className="mb-3 text-foreground tracking-tight">Sign In</h1>
        <p className="text-muted-foreground">
          Access your Brand Sense dashboard
        </p>
      </div>


      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 border border-destructive/50 rounded-lg bg-destructive/10 space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-destructive mb-2">{error}</p>
              {error.includes('Invalid email or password') && (
                <div className="space-y-2 text-[13px]">
                  <p className="text-destructive/80 font-medium">Most likely cause:</p>
                  <p className="text-destructive/70 bg-destructive/5 p-2 rounded border border-destructive/20">
                    This account doesn't exist. Click "Sign Up" below to create a new account instead.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Google Sign In - Disabled */}
        <Button 
          variant="outline" 
          disabled={true}
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
          Continue with Google (Coming Soon)
        </Button>

        <div className="relative my-6">
          <Separator className="bg-border" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-background px-3 text-muted-foreground uppercase tracking-wider">or</span>
          </div>
        </div>

        {/* Email/Password Form - DISABLED if stale data detected */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="h-11 bg-card border-border focus:border-primary transition-colors"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <button 
                onClick={() => onNavigate?.('forgot')}
                disabled={isLoading}
                className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                Forgot?
              </button>
            </div>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="h-11 bg-card border-border focus:border-primary transition-colors"
            />
          </div>

          <Button 
            onClick={handleSubmit}
            disabled={!email || !password || isLoading}
            className="w-full h-11 mt-6 bg-primary hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </div>

        <div className="text-center mt-8 pt-6 border-t border-border">
          <span className="text-muted-foreground">
            Don't have an account? 
          </span>
          <button 
            onClick={() => onNavigate?.('signup')}
            disabled={isLoading}
            className="text-foreground hover:text-primary transition-colors disabled:opacity-50"
          >
            Sign Up
          </button>
        </div>

        {/* Debug: Clear Data Button */}
        {(
          <div className="text-center mt-4">
            <button 
              onClick={() => {
                if (confirm('This will clear all local data including saved projects. Are you sure?')) {
                  storage.clearAll();
                  window.location.reload();
                }
              }}
              className="text-muted-foreground/60 hover:text-muted-foreground transition-colors text-[13px]"
            >
              Clear All Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
