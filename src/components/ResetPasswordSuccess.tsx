import { Button } from "./ui/button";
import { CheckCircle2 } from "lucide-react";

interface ResetPasswordSuccessProps {
  onNavigate?: (screen: string) => void;
}

export function ResetPasswordSuccess({ onNavigate }: ResetPasswordSuccessProps) {
  return (
    <div className="w-full max-w-[400px] mx-auto text-center">
      <div className="mb-10">
        <div className="w-16 h-16 rounded-full bg-success/10 border border-success/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-success" />
        </div>
        <h1 className="mb-3 text-foreground tracking-tight">Password Reset Complete</h1>
        <p className="text-muted-foreground">
          Your password has been successfully reset. You can now sign in with your new password.
        </p>
      </div>

      <div className="space-y-4">
        {/* Primary Action */}
        <Button 
          onClick={() => onNavigate?.('signin')}
          className="w-full h-11 bg-primary hover:bg-primary/90 transition-all duration-200"
        >
          Continue to Sign In
        </Button>

        {/* Security Notice */}
        <div className="pt-6 border-t border-border">
          <p className="text-muted-foreground">
            For security reasons, you've been signed out of all devices. Please sign in again with your new password.
          </p>
        </div>
      </div>
    </div>
  );
}
