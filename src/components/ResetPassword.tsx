import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { AlertCircle } from "lucide-react";

interface ResetPasswordProps {
  onNavigate?: (screen: string) => void;
}

export function ResetPassword({ onNavigate }: ResetPasswordProps) {
  return (
    <div className="w-full max-w-[400px] mx-auto">
      <div className="mb-10">
        <h1 className="mb-3 text-foreground tracking-tight">Set New Password</h1>
        <p className="text-muted-foreground">
          Choose a new password for your account
        </p>
      </div>

      <div className="space-y-6">
        <div className="p-4 bg-card border border-border rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Reset request for</span>
            <span className="text-foreground font-mono">you@example.com</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-password" className="text-foreground">New Password</Label>
          <Input 
            id="new-password" 
            type="password" 
            placeholder="At least 8 characters"
            className="h-11 bg-card border-border focus:border-primary transition-colors"
          />
          <p className="text-muted-foreground">
            Must contain at least 8 characters, one uppercase letter, and one number
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="text-foreground">Confirm Password</Label>
          <Input 
            id="confirm-password" 
            type="password" 
            placeholder="••••••••"
            className="h-11 bg-card border-border focus:border-primary transition-colors"
          />
        </div>

        <div className="flex items-start gap-3 p-4 border border-yellow-500/20 bg-yellow-500/5 rounded-lg">
          <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-yellow-500">This link expires in 45 minutes</p>
          </div>
        </div>

        <Button 
          onClick={() => onNavigate?.('reset-success')}
          className="w-full h-11 bg-primary hover:bg-primary/90 transition-all duration-200"
        >
          Update Password
        </Button>

        <div className="text-center pt-4">
          <button 
            onClick={() => onNavigate?.('signin')}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}