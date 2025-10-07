import { Button } from "./ui/button";
import { XCircle, AlertCircle } from "lucide-react";

interface ResetPasswordFailProps {
  onNavigate?: (screen: string) => void;
}

export function ResetPasswordFail({ onNavigate }: ResetPasswordFailProps) {
  return (
    <div className="w-full max-w-[400px] mx-auto text-center">
      <div className="mb-10">
        <div className="w-16 h-16 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="mb-3 text-foreground tracking-tight">Password Reset Failed</h1>
        <p className="text-muted-foreground">
          We couldn't reset your password. The reset link may have expired or is no longer valid.
        </p>
      </div>

      {/* Common Reasons */}
      <div className="mb-6 p-4 border border-border rounded-lg bg-card text-left space-y-3">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-foreground mb-1">Common reasons:</p>
            <ul className="text-muted-foreground space-y-1">
              <li>• Reset link expired (valid for 1 hour only)</li>
              <li>• Link was already used</li>
              <li>• Password was recently changed</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Primary Action */}
        <Button 
          onClick={() => onNavigate?.('forgot')}
          className="w-full h-11 bg-primary hover:bg-primary/90 transition-all duration-200"
        >
          Request New Reset Link
        </Button>

        {/* Secondary Action */}
        <Button
          variant="outline"
          onClick={() => onNavigate?.('signin')}
          className="w-full h-11 bg-card border-border hover:bg-secondary/80 transition-all duration-200"
        >
          Back to Sign In
        </Button>

        {/* Help Text */}
        <div className="pt-6 border-t border-border">
          <p className="text-muted-foreground">
            Still having trouble?{" "}
            <button className="text-foreground hover:text-primary transition-colors">
              Contact support
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
