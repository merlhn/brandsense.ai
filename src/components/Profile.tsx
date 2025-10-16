import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { User, Mail, Briefcase, Lock, Check, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { storage } from "../lib/storage";
import { API_CONFIG } from "../lib/api";
import { logger } from "../lib/logger";
import { toast } from "sonner@2.0.3";

interface ProfileProps {
  onNavigate?: (screen: string) => void;
}

export function Profile({ onNavigate }: ProfileProps) {
  // Personal Information State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");
  

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI State
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Load user data from storage on mount
  useEffect(() => {
    const storedEmail = storage.getUserEmail();
    const storedFullName = storage.getUserFullName();
    const storedPosition = localStorage.getItem('user_position');

    setEmail(storedEmail || '');
    setFullName(storedFullName || '');
    setPosition(storedPosition || '');
    
    logger.info('Profile loaded', { email: storedEmail, fullName: storedFullName });
  }, []);



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
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD}`,
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
                Manage your profile information and preferences
              </p>
            </div>
            {showSuccessMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-success/10 border border-success/20"
              >
                <Check className="w-4 h-4 text-success" />
                <span className="text-success tracking-tight">Changes saved successfully</span>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="space-y-8">
          {/* Personal Information */}
          <section className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-foreground tracking-tight mb-1">Personal Information</h2>
                <p className="text-muted-foreground tracking-tight">
                  View your personal details
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-foreground">
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  disabled
                  className="h-11 bg-input-background border-border opacity-60 cursor-not-allowed"
                />
                <p className="text-muted-foreground tracking-tight">
                  Full name cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="position" className="text-foreground">
                  <Briefcase className="w-4 h-4 inline mr-2" />
                  Position
                </Label>
                <Input
                  id="position"
                  value={position}
                  disabled
                  className="h-11 bg-input-background border-border opacity-60 cursor-not-allowed"
                />
                <p className="text-muted-foreground tracking-tight">
                  Position cannot be changed
                </p>
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="email" className="text-foreground">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  value={email}
                  disabled
                  className="h-11 bg-input-background border-border opacity-60 cursor-not-allowed"
                />
                <p className="text-muted-foreground tracking-tight">
                  Email address cannot be changed
                </p>
              </div>
            </div>
          </section>

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
