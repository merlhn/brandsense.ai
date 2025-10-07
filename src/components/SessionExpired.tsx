import { Button } from "./ui/button";
import { AlertCircle, Clock } from "lucide-react";

interface SessionExpiredProps {
  onNavigate?: (screen: string) => void;
}

export function SessionExpired({ onNavigate }: SessionExpiredProps) {
  return (
    <div className="w-full max-w-[400px] mx-auto text-center">
      <div className="mb-10">
        <div className="w-16 h-16 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center mx-auto mb-6">
          <Clock className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="mb-3 text-foreground tracking-tight">Session Expired</h1>
        <p className="text-muted-foreground">
          Your session has expired for security reasons. Please sign in again to continue.
        </p>
      </div>

      {/* Info Box */}
      <div className="mb-6 p-4 border border-border rounded-lg bg-card flex items-start gap-3 text-left">
        <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
        <div>
          <p className="text-foreground mb-1">Why did this happen?</p>
          <p className="text-muted-foreground">
            Sessions expire after 24 hours of inactivity to protect your account security.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Primary Action */}
        <Button 
          onClick={() => onNavigate?.('signin')}
          className="w-full h-11 bg-primary hover:bg-primary/90 transition-all duration-200"
        >
          Sign In Again
        </Button>

        {/* Secondary Action */}
        <Button
          variant="outline"
          onClick={() => onNavigate?.('forgot')}
          className="w-full h-11 bg-card border-border hover:bg-secondary/80 transition-all duration-200"
        >
          Forgot Password?
        </Button>

        {/* Help Text */}
        <div className="pt-6 border-t border-border">
          <p className="text-muted-foreground">
            Having trouble accessing your account?{" "}
            <button className="text-foreground hover:text-primary transition-colors">
              Contact support
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
