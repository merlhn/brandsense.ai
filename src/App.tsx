import { useState, useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BrandLogo } from "./components/BrandLogo";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LoadingScreen } from "./components/LoadingScreen";
import { validateUserSession } from "./lib/session-validator";
import { SCREENS, type Screen } from "./lib/constants";
import { Toaster } from "./components/ui/sonner";

// Lazy load heavy components for better initial load performance
const LandingPage = lazy(() => import("./components/LandingPage").then(m => ({ default: m.LandingPage })));
const SignIn = lazy(() => import("./components/SignIn").then(m => ({ default: m.SignIn })));
const SignUp = lazy(() => import("./components/SignUp").then(m => ({ default: m.SignUp })));
const ForgotPassword = lazy(() => import("./components/ForgotPassword").then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import("./components/ResetPassword").then(m => ({ default: m.ResetPassword })));
const ResetPasswordSuccess = lazy(() => import("./components/ResetPasswordSuccess").then(m => ({ default: m.ResetPasswordSuccess })));
const ResetPasswordFail = lazy(() => import("./components/ResetPasswordFail").then(m => ({ default: m.ResetPasswordFail })));
const SessionExpired = lazy(() => import("./components/SessionExpired").then(m => ({ default: m.SessionExpired })));
const CreateProject = lazy(() => import("./components/CreateProject").then(m => ({ default: m.CreateProject })));
const DashboardLayout = lazy(() => import("./components/DashboardLayout").then(m => ({ default: m.DashboardLayout })));
const TermsOfService = lazy(() => import("./components/TermsOfService").then(m => ({ default: m.TermsOfService })));
const PrivacyPolicy = lazy(() => import("./components/PrivacyPolicy").then(m => ({ default: m.PrivacyPolicy })));
const RefundPolicy = lazy(() => import("./components/RefundPolicy").then(m => ({ default: m.RefundPolicy })));

export default function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>(SCREENS.LANDING);
  const [isValidating, setIsValidating] = useState(true);

  // Handle URL-based routing
  useEffect(() => {
    const handleRoute = () => {
      const path = window.location.pathname;
      
      // URL-based routing for all pages
      if (path === '/') {
        setActiveScreen(SCREENS.LANDING);
        setIsValidating(false);
        return;
      }
      
      // Redirect /landing to root
      if (path === '/landing') {
        window.history.replaceState({}, '', '/');
        setActiveScreen(SCREENS.LANDING);
        setIsValidating(false);
        return;
      }
      
      if (path === '/signin') {
        setActiveScreen(SCREENS.SIGN_IN);
        setIsValidating(false);
        return;
      }
      
      if (path === '/signup') {
        setActiveScreen(SCREENS.SIGN_UP);
        setIsValidating(false);
        return;
      }
      
      if (path === '/forgot-password') {
        setActiveScreen(SCREENS.FORGOT_PASSWORD);
        setIsValidating(false);
        return;
      }
      
      if (path === '/reset-password') {
        setActiveScreen(SCREENS.RESET_PASSWORD);
        setIsValidating(false);
        return;
      }
      
      if (path === '/reset-success') {
        setActiveScreen(SCREENS.RESET_SUCCESS);
        setIsValidating(false);
        return;
      }
      
      if (path === '/reset-fail') {
        setActiveScreen(SCREENS.RESET_FAIL);
        setIsValidating(false);
        return;
      }
      
      if (path === '/session-expired') {
        setActiveScreen(SCREENS.SESSION_EXPIRED);
        setIsValidating(false);
        return;
      }
      
      if (path === '/terms' || path === '/terms-of-service') {
        setActiveScreen(SCREENS.TERMS_OF_SERVICE);
        setIsValidating(false);
        return;
      }
      
      if (path === '/privacy' || path === '/privacy-policy') {
        setActiveScreen(SCREENS.PRIVACY_POLICY);
        setIsValidating(false);
        return;
      }
      
    if (path === '/refund' || path === '/refund-policy') {
      setActiveScreen(SCREENS.REFUND_POLICY);
      setIsValidating(false);
      return;
    }
      
      if (path === '/onboarding' || path === '/onboarding/brand') {
        setActiveScreen(SCREENS.CREATE_PROJECT);
        setIsValidating(false);
        return;
      }
      
      if (path === '/dashboard' || path.startsWith('/dashboard/')) {
        setActiveScreen(SCREENS.DASHBOARD);
        setIsValidating(false);
        return;
      }
      
      // Default: validate session for other routes
      const validate = async () => {
        const result = await validateUserSession();
        setActiveScreen(result.screen);
        setIsValidating(false);
      };
      
      validate();
    };
    
    handleRoute();
    
    // Listen for browser back/forward
    window.addEventListener('popstate', handleRoute);
    return () => window.removeEventListener('popstate', handleRoute);
  }, []);

  // Show loading while validating
  if (isValidating) {
    return <LoadingScreen message="Loading..." />;
  }

  const handleNavigate = (screen: string) => {
    setActiveScreen(screen as Screen);
    
    // Update URL based on screen
    const pathMap: Record<string, string> = {
      [SCREENS.LANDING]: '/landing',
      [SCREENS.SIGN_IN]: '/signin',
      [SCREENS.SIGN_UP]: '/signup',
      [SCREENS.FORGOT_PASSWORD]: '/forgot-password',
      [SCREENS.RESET_PASSWORD]: '/reset-password',
      [SCREENS.RESET_SUCCESS]: '/reset-success',
      [SCREENS.RESET_FAIL]: '/reset-fail',
      [SCREENS.SESSION_EXPIRED]: '/session-expired',
      [SCREENS.CREATE_PROJECT]: '/onboarding',
      [SCREENS.DASHBOARD]: '/dashboard',
    };
    
    const path = pathMap[screen] || '/landing';
    window.history.pushState({}, '', path);
  };

  // Common props interface for screen components
  interface ScreenComponentProps {
    onNavigate?: (screen: string) => void;
  }

  // Screen to component mapping
  const SCREEN_COMPONENTS: Record<Screen, React.ComponentType<ScreenComponentProps>> = {
    [SCREENS.LANDING]: LandingPage,
    [SCREENS.SIGN_IN]: SignIn,
    [SCREENS.SIGN_UP]: SignUp,
    [SCREENS.FORGOT_PASSWORD]: ForgotPassword,
    [SCREENS.RESET_PASSWORD]: ResetPassword,
    [SCREENS.RESET_SUCCESS]: ResetPasswordSuccess,
    [SCREENS.RESET_FAIL]: ResetPasswordFail,
    [SCREENS.SESSION_EXPIRED]: SessionExpired,
    [SCREENS.CREATE_PROJECT]: CreateProject,
    [SCREENS.DASHBOARD]: DashboardLayout,
    [SCREENS.TERMS_OF_SERVICE]: TermsOfService,
    [SCREENS.PRIVACY_POLICY]: PrivacyPolicy,
    [SCREENS.REFUND_POLICY]: RefundPolicy,
  };

  const ActiveComponent = SCREEN_COMPONENTS[activeScreen] || LandingPage;

  // Landing page, Dashboard layout, Terms of Service, Privacy Policy, and Refund Policy use full screen without default header/footer
  if (activeScreen === SCREENS.LANDING || activeScreen === SCREENS.DASHBOARD || activeScreen === SCREENS.TERMS_OF_SERVICE || activeScreen === SCREENS.PRIVACY_POLICY || activeScreen === SCREENS.REFUND_POLICY) {
    return (
      <ErrorBoundary>
        <Toaster />
        <Suspense fallback={<LoadingScreen message="Loading..." />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeScreen}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.2,
                ease: [0.23, 1, 0.32, 1],
              }}
            >
              <ActiveComponent onNavigate={handleNavigate} />
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Toaster />
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Minimal Header */}
        <header className="absolute top-0 left-0 right-0 z-40">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center">
            <BrandLogo />
          </div>
        </header>

        {/* Main Content Area with Animated Transitions */}
        <main className="flex-1 flex items-center justify-center px-6 py-20">
          <Suspense fallback={<LoadingScreen message="Loading..." />}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeScreen}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{
                  duration: 0.2,
                  ease: [0.23, 1, 0.32, 1],
                }}
                className="w-full"
              >
                <ActiveComponent onNavigate={handleNavigate} />
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </main>

        {/* Minimal Footer */}
        <footer className="py-6 border-t border-border/50">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-muted-foreground tracking-tight">
              Brand Sense © 2025
            </p>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}