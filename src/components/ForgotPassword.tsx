import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ArrowLeft } from "lucide-react";

interface ForgotPasswordProps {
  onNavigate?: (screen: string) => void;
}

export function ForgotPassword({ onNavigate }: ForgotPasswordProps) {
  return (
    <div className="w-full max-w-[400px] mx-auto">
      <button 
        onClick={() => onNavigate?.('signin')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="mb-10">
        <h1 className="mb-3 text-foreground tracking-tight">Reset Password</h1>
        <p className="text-muted-foreground">
          Enter your email and we'll send you a reset link
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="forgot-email" className="text-foreground">Email</Label>
          <Input 
            id="forgot-email" 
            type="email" 
            placeholder="you@example.com"
            className="h-11 bg-card border-border focus:border-primary transition-colors"
          />
        </div>

        <div className="p-4 border border-border rounded-lg bg-card">
          <p className="text-muted-foreground">
            A password reset link will be sent to your email. The link expires in 1 hour.
          </p>
        </div>

        <Button 
          onClick={() => onNavigate?.('reset')}
          className="w-full h-11 bg-primary hover:bg-primary/90 transition-all duration-200"
        >
          Send Reset Link
        </Button>

        <div className="text-center pt-4">
          <span className="text-muted-foreground">Remember your password? </span>
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