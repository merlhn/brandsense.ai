import { useState } from "react";
import { Lock, Check, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { storage } from "../lib/storage";
import { projectId } from "../utils/supabase/info";
import { toast } from "sonner@2.0.3";

interface ProfileProps {
  onNavigate?: (screen: string) => void;
}

export function Profile({ onNavigate }: ProfileProps) {

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");


  // UI State
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);



  const handleSavePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    
    setIsSavingPassword(true);
    
    try {
      const accessToken = storage.getAccessToken();
      if (!accessToken) {
        toast.error("Session expired. Please sign in again.");
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cf9a9609/auth/change-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to change password');
        setIsSavingPassword(false);
        return;
      }

      // Success
      setIsSavingPassword(false);
      setIsEditingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      
    } catch (error) {
      console.error('Password change error:', error);
      toast.error('Failed to change password. Please try again.');
      setIsSavingPassword(false);
    }
  };


  const handleCancelPassword = () => {
    setIsEditingPassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-foreground tracking-tight mb-1">Profile Settings</h1>
              <p className="text-muted-foreground tracking-tight">
                Manage your account information and preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="space-y-8">

          {/* Password Change */}
          <section className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-foreground tracking-tight mb-1">Password</h2>
                <p className="text-muted-foreground tracking-tight">
                  Update your password to keep your account secure
                </p>
              </div>
              {!isEditingPassword ? (
                <Button
                  onClick={() => setIsEditingPassword(true)}
                  variant="outline"
                  className="h-9 px-4 bg-card border-border hover:bg-secondary/80"
                >
                  Change Password
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleCancelPassword}
                    variant="outline"
                    className="h-9 px-4 bg-card border-border hover:bg-secondary/80"
                  >
                    <X className="w-4 h-4 mr-1.5" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSavePassword}
                    disabled={isSavingPassword || !currentPassword || !newPassword || !confirmPassword}
                    className="h-9 px-4 bg-primary hover:bg-primary/90"
                  >
                    {isSavingPassword ? (
                      "Updating..."
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-1.5" />
                        Update Password
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {isEditingPassword ? (
              <div className="space-y-4 max-w-lg">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-foreground">
                    Current Password
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="h-11 bg-input-background border-border"
                    placeholder="Enter your current password"
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-foreground">
                    New Password
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-11 bg-input-background border-border"
                    placeholder="Enter new password"
                  />
                  <p className="text-muted-foreground tracking-tight">
                    Must be at least 8 characters long
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-foreground">
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-11 bg-input-background border-border"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Lock className="w-5 h-5" />
                <p className="tracking-tight">
                  Password last changed 30 days ago
                </p>
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}
