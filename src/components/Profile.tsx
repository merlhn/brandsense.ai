import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { User, Mail, Briefcase, Lock, Check, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";
import { storage } from "../lib/storage";

interface ProfileProps {
  onNavigate?: (screen: string) => void;
}

export function Profile({ onNavigate }: ProfileProps) {
  // User Info State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");
  const [company, setCompany] = useState("");
  
  // Store original values for cancel functionality
  const [originalFullName, setOriginalFullName] = useState("");
  const [originalPosition, setOriginalPosition] = useState("");
  const [originalCompany, setOriginalCompany] = useState("");

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Settings State
  const [emailNotifications, setEmailNotifications] = useState(true);

  // UI State
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Load user data from storage on mount
  useEffect(() => {
    const storedEmail = storage.getUserEmail();
    const storedFullName = storage.getUserFullName();
    const storedPosition = localStorage.getItem('user_position');
    const storedCompany = localStorage.getItem('user_company');

    setEmail(storedEmail || '');
    setFullName(storedFullName || '');
    setPosition(storedPosition || '');
    setCompany(storedCompany || '');
    
    // Store original values
    setOriginalFullName(storedFullName || '');
    setOriginalPosition(storedPosition || '');
    setOriginalCompany(storedCompany || '');
    
    console.log('📧 Profile loaded:', { email: storedEmail, fullName: storedFullName });
  }, []);

  const handleSaveInfo = async () => {
    setIsSavingInfo(true);
    
    // Save to localStorage
    storage.setUserFullName(fullName.trim());
    localStorage.setItem('user_position', position.trim());
    localStorage.setItem('user_company', company.trim());
    
    // Update original values
    setOriginalFullName(fullName.trim());
    setOriginalPosition(position.trim());
    setOriginalCompany(company.trim());
    
    // Simulate API call (can be replaced with Supabase call later)
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setIsSavingInfo(false);
    setIsEditingInfo(false);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleSavePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match");
      return;
    }
    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }
    
    setIsSavingPassword(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSavingPassword(false);
    setIsEditingPassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleCancelInfo = () => {
    setIsEditingInfo(false);
    // Reset to original values from localStorage
    setFullName(originalFullName);
    setPosition(originalPosition);
    setCompany(originalCompany);
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
          {/* Profile Picture & Basic Info */}
          <section className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-foreground tracking-tight mb-1">Personal Information</h2>
                <p className="text-muted-foreground tracking-tight">
                  Update your personal details
                </p>
              </div>
              {!isEditingInfo ? (
                <Button
                  onClick={() => setIsEditingInfo(true)}
                  variant="outline"
                  className="h-9 px-4 bg-card border-border hover:bg-secondary/80"
                >
                  Edit
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleCancelInfo}
                    variant="outline"
                    className="h-9 px-4 bg-card border-border hover:bg-secondary/80"
                  >
                    <X className="w-4 h-4 mr-1.5" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveInfo}
                    disabled={isSavingInfo}
                    className="h-9 px-4 bg-primary hover:bg-primary/90"
                  >
                    {isSavingInfo ? (
                      "Saving..."
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-1.5" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              )}
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
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={!isEditingInfo}
                  className="h-11 bg-input-background border-border disabled:opacity-100 disabled:cursor-default"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position" className="text-foreground">
                  <Briefcase className="w-4 h-4 inline mr-2" />
                  Position
                </Label>
                <Input
                  id="position"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  disabled={!isEditingInfo}
                  className="h-11 bg-input-background border-border disabled:opacity-100 disabled:cursor-default"
                />
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

          {/* Preferences */}
          <section className="bg-card border border-border rounded-lg p-6">
            <div className="mb-6">
              <h2 className="text-foreground tracking-tight mb-1">Preferences</h2>
              <p className="text-muted-foreground tracking-tight">
                Customize your notification settings
              </p>
            </div>

            <div className="space-y-6">
              {/* Email Notifications */}
              <div>
                <h3 className="text-foreground tracking-tight mb-4">Email Notifications</h3>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="emailNotifications" className="text-foreground cursor-pointer">
                      Marketing emails
                    </Label>
                    <p className="text-muted-foreground tracking-tight mt-1">
                      Receive emails about new features and updates
                    </p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
