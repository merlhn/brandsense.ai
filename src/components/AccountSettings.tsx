import { useState } from "react";
import { motion } from "motion/react";
import { Trash2, Key, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

interface AccountSettingsProps {
  onNavigate?: (screen: string) => void;
}

export function AccountSettings({ onNavigate }: AccountSettingsProps) {

  // UI State
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState("");


  const handleDeleteAccount = () => {
    // Handle account deletion
    if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
      console.log("Account deleted");
    }
    
    // Reset confirmation input
    setDeleteConfirmation("");
    
    onNavigate?.("signin");
  };

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-foreground tracking-tight mb-1">Account Settings</h1>
              <p className="text-muted-foreground tracking-tight">
                Manage your account preferences and settings
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
                <span className="text-success tracking-tight">Settings saved</span>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="space-y-8">


          {/* Danger Zone */}
          <section className="bg-card border border-destructive/50 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-destructive tracking-tight mb-1">Danger Zone</h2>
                <p className="text-muted-foreground tracking-tight mb-6">
                  Irreversible and destructive actions
                </p>

                <div className="flex items-start justify-between border border-border rounded-lg p-4">
                  <div>
                    <h3 className="text-foreground tracking-tight mb-1">Delete your account</h3>
                    <p className="text-muted-foreground tracking-tight">
                      Once you delete your account, there is no going back. All projects and data will be permanently deleted.
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="ml-4 h-9 px-4 bg-card border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-1.5" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-border">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-foreground">
                          Delete your account?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                          This action cannot be undone. This will permanently delete your account,
                          all projects, and remove all associated data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      
                      <div className="space-y-2 pt-4">
                        <Label htmlFor="deleteAccountConfirmation" className="text-foreground tracking-tight">
                          To confirm, type <span className="text-destructive font-medium">delete</span> below:
                        </Label>
                        <Input
                          id="deleteAccountConfirmation"
                          value={deleteConfirmation}
                          onChange={(e) => setDeleteConfirmation(e.target.value)}
                          placeholder="Type 'delete' to confirm"
                          className="h-11 bg-input-background border-border"
                          autoComplete="off"
                        />
                      </div>
                      
                      <AlertDialogFooter>
                        <AlertDialogCancel 
                          className="bg-card border-border hover:bg-secondary/80"
                          onClick={() => setDeleteConfirmation("")}
                        >
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          disabled={deleteConfirmation !== "delete"}
                          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
